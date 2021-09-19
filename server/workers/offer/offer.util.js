const u = require('../../features/util/util');
const Book = require('./book.class');
const { client, rediskeys, set } = require('../../db/redis');

const { Offer, ProtectedMatch } = require('../../models');
const logger = require('../../utilities/logger');

// Access the correct book or make one if necessary
function getBook(books, ContestId, NFLPlayerId) {
  // eslint-disable-next-line no-param-reassign
  if (!books[ContestId]) { books[ContestId] = {}; }
  if (!books[ContestId][NFLPlayerId]) {
    // eslint-disable-next-line no-param-reassign
    books[ContestId][NFLPlayerId] = new Book(ContestId, NFLPlayerId);
  }
  const playerBook = books[ContestId][NFLPlayerId];
  // There may be existing offers and matches in the DB, so add them to the book
  if (!playerBook.init) {
    playerBook.init = true;
    playerBook.enqueue(() => initializeBook(playerBook));
  }
  return playerBook;
}

// Generate the starting book based on existing offers in DB
async function initializeBook(playerBook) {
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
      ['updatedAt', 'ASC'],
    ],
  }).then(u.dv);
  sortedOffers.forEach((o) => playerBook.add(o));
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

// Send out latest price info based on book
function updateBest(playerBook) {
  const { contestID, nflplayerID } = playerBook;

  const bestbids = [playerBook.bestbid, playerBook.bestpbid].filter((e) => e);
  const bestasks = [playerBook.bestask, playerBook.bestpask].filter((e) => e);

  let bestbid = 0;
  let bestask = 0;
  if (bestbids.length === 2) bestbid = Math.max(...bestbids);
  if (bestbids.length === 1) [bestbid] = bestbids;
  if (bestasks.length === 2) bestask = Math.min(...bestasks);
  if (bestasks.length === 1) [bestask] = bestasks;

  set.hkey(rediskeys.bestbidHash(contestID), nflplayerID, bestbid);
  set.hkey(rediskeys.bestaskHash(contestID), nflplayerID, bestask);

  client.publish('priceUpdate', JSON.stringify({
    contestID,
    nflplayerID,
    bestbid,
    bestask,
  }));
}

module.exports = {
  getBook,
  updateBest,
};
