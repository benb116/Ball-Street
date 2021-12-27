import logger from '../../utilities/logger';
import { dv } from '../../features/util/util';

import { rediskeys, client } from '../../db/redis';

import priceUpdate from '../live/channels/priceUpdate.channel';

import Book from './book.offer';

import Offer, { OfferType } from '../../features/offer/offer.model';
import ProtectedMatch, { ProtectedMatchType } from '../../features/protectedmatch/protectedmatch.model';

// Access the correct book or make one if necessary
export function getBook(
  books: Record<string, Record<string, Book>>,
  ContestId: number,
  NFLPlayerId: number,
) {
  // eslint-disable-next-line no-param-reassign
  if (!books[ContestId]) { books[ContestId] = {}; }
  if (!books[ContestId][NFLPlayerId]) {
    // eslint-disable-next-line no-param-reassign
    books[ContestId][NFLPlayerId] = new Book(ContestId, NFLPlayerId);
  }
  const playerBook = books[ContestId][NFLPlayerId];
  // There may be existing offers and matches in the DB, so add them to the book
  // If the book hasn't been inited, try to init
  if (!playerBook.init) {
    // It's possible that the book will been called again before the first init is complete
    // In that case, we don't want to mark the book as init=true until it's ready
    // But we also don't want to have the second call reinit the book
    // So add the init process as an item on the book queue
    // The first will complete, and when the second is attempted, init will be true so exit.
    playerBook.enqueue(async () => {
      if (playerBook.init) return;
      await initializeBook(playerBook)
        .then(() => { playerBook.init = true; })
        .catch((err) => {
          playerBook.init = false;
          throw Error(err);
        });
    });
  }
  return playerBook;
}

// Generate the starting book based on existing offers in DB
async function initializeBook(playerBook: Book) {
  const { contestID, nflplayerID } = playerBook;
  // Should be sorted oldest first since Maps maintain order
  const sortedOffers: OfferType[] = await Offer.findAll({
    where: {
      ContestId: contestID,
      NFLPlayerId: nflplayerID,
      filled: false,
      cancelled: false,
    },
    order: [
      ['createdAt', 'ASC'],
    ],
  }).then(dv);
  sortedOffers.forEach((o) => playerBook.add(o));
  // Also add protected matches that have been previously created
  const protMatches: ProtectedMatchType[] = await ProtectedMatch.findAll({
    include: {
      model: Offer,
      as: 'existing',
      where: {
        ContestId: contestID,
        NFLPlayerId: nflplayerID,
      },
    },
  }).then(dv);
  protMatches.forEach((m) => {
    // eslint-disable-next-line no-param-reassign
    playerBook.protMatchMap[m.existingId] = m.newId;
  });
  logger.info(`Book initialized: Contest ${contestID} Player ${nflplayerID}`);
  return true;
}

// Send out latest price info based on book
export function updateBest(playerBook: Book) {
  const { contestID, nflplayerID } = playerBook;

  const bestbids = [playerBook.bestbid, playerBook.bestpbid].filter((e) => e !== null).map(Number);
  const bestasks = [playerBook.bestask, playerBook.bestpask].filter((e) => e !== null).map(Number);

  let bestbid = 0;
  let bestask = 0;
  if (bestbids.length === 2) bestbid = Math.max(...bestbids);
  if (bestbids.length === 1) [bestbid] = bestbids;
  if (bestasks.length === 2) bestask = Math.min(...bestasks);
  if (bestasks.length === 1) [bestask] = bestasks;

  client.HSET(rediskeys.bestbidHash(contestID), [nflplayerID.toString(), bestbid.toString()]);
  client.HSET(rediskeys.bestaskHash(contestID), [nflplayerID.toString(), bestask.toString()]);

  priceUpdate.pub('best', contestID, nflplayerID, bestbid, bestask);
}
