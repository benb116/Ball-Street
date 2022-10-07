import logger from '../../utilities/logger';

import bestbid from '../../db/redis/bestbid.redis';
import bestask from '../../db/redis/bestask.redis';

import priceUpdate from '../live/channels/priceUpdate.channel';

import Book from './book.offer';

import Offer from '../../features/offer/offer.model';
import ProtectedMatch from '../../features/protectedmatch/protectedmatch.model';

/** Access the correct book or make one if necessary */
export function getBook(
  books: Record<string, Record<string, Book>>,
  ContestId: number,
  NFLPlayerId: number,
) {
  // eslint-disable-next-line no-param-reassign
  if (!books[ContestId]) { books[ContestId] = {}; }
  const contestbooks = books[ContestId];
  if (!contestbooks) return null;
  if (!contestbooks[NFLPlayerId]) {
    // eslint-disable-next-line no-param-reassign
    contestbooks[NFLPlayerId] = new Book(ContestId, NFLPlayerId);
  }
  const playerBook = contestbooks[NFLPlayerId];
  if (!playerBook) return null;
  // There may be existing offers and matches in the DB, so add them to the book
  // If the book hasn't been inited, try to init
  if (!playerBook.init) {
    playerBook.enqueue(async () => { await beginBook(playerBook); });
  }
  return playerBook;
}

/** It's possible that the book will been called again before the first init is complete.
 * In that case, we don't want to mark the book as init=true until it's ready,
 * but we also don't want to have the second call reinit the book.
 * So add the init process as an item on the book queue.
 * The first will complete, and when the second is attempted, init will be true so exit.
 */
async function beginBook(playerBook: Book) {
  if (playerBook.init) return Promise.resolve();
  return initializeBook(playerBook)
    // eslint-disable-next-line no-param-reassign
    .then(() => { playerBook.init = true; })
    .catch((err) => {
      // eslint-disable-next-line no-param-reassign
      playerBook.init = false;
      throw Error(err);
    });
}

/** Generate the starting book based on existing offers in DB */
async function initializeBook(playerBook: Book) {
  const { contestID, nflplayerID } = playerBook;
  // Should be sorted oldest first since Maps maintain order
  const sortedOffers = await Offer.findAll({
    where: {
      ContestId: contestID,
      NFLPlayerId: nflplayerID,
      filled: false,
      cancelled: false,
    },
    order: [
      ['createdAt', 'ASC'],
    ],
  });
  sortedOffers.forEach((o) => playerBook.add(o.toJSON()));
  // Also add protected matches that have been previously created
  const protMatches = await ProtectedMatch.findAll({
    include: {
      model: Offer,
      as: 'existing',
      where: {
        ContestId: contestID,
        NFLPlayerId: nflplayerID,
      },
    },
  });
  protMatches.forEach((m) => {
    // eslint-disable-next-line no-param-reassign
    playerBook.protMatchMap[m.existingId] = m.newId;
  });
  logger.info(`Book initialized: Contest ${contestID} Player ${nflplayerID}`);
  return true;
}

/** Send out latest price info based on book */
export function updateBest(playerBook: Book) {
  const { contestID, nflplayerID } = playerBook;

  const bestbids = [playerBook.bestbid, playerBook.bestpbid].filter((e) => e !== null).map(Number);
  const bestasks = [playerBook.bestask, playerBook.bestpask].filter((e) => e !== null).map(Number);

  let playerbestbid = 0;
  let playerbestask = 0;
  if (bestbids.length === 2) playerbestbid = Math.max(...bestbids);
  if (bestbids.length === 1) playerbestbid = bestbids[0] || 0;
  if (bestasks.length === 2) playerbestask = Math.min(...bestasks);
  if (bestasks.length === 1) playerbestask = bestasks[0] || 0;

  bestbid.set(contestID, nflplayerID, playerbestbid);
  bestask.set(contestID, nflplayerID, playerbestask);

  priceUpdate.pub('best', contestID, nflplayerID, playerbestbid, playerbestask);
}
