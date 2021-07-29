/* eslint-disable no-await-in-loop */
// Offer server worker
// Processes jobs on the offer queue
// Tries to reduce order book whenever an offer comes in
// Sends out matches to be filled
const Queue = require('bull');
const config = require('../config');
const Book = require('./offer/book.class');

const u = require('../features/util/util');

const {
  queueOptions, client, rediskeys, get, set,
} = require('../db/redis');

const { hash } = rediskeys;

const offerQueue = new Queue('offer-queue', queueOptions);
const protectedQueue = new Queue('protected-queue', queueOptions);

const { Offer } = require('../models');
const { fillOffers } = require('./offer/trader');

// books[contestID][playerID] = Book
const books = { };
/*
  Each book has a queue of promises that can be chained to.
  This means that functions can be guaranteed to run sequentially.
  Any operation on a book should be done by "enqueueing" it like so:
  playerBook.enqueue(() => { doSomething(input); });
  That way there will be no race conditions within a single contest+player
  Other race conditions could still occur at the DB,
  but those should be handled by transactions.
*/

const parallelProcessors = 10;

// When a new offer comes in
offerQueue.process(parallelProcessors, (job) => {
  const { ContestId, NFLPlayerId } = job.data;

  const playerBook = getBook(ContestId, NFLPlayerId); // Get the appropriate book (or make one)
  // Add the action to the queue
  if (job.data.cancelled) {
    playerBook.enqueue(() => { playerBook.cancel(job.data); });
  } else {
    playerBook.enqueue(() => { playerBook.add(job.data); });
  }
  // Add an evaluation to the queue
  playerBook.enqueue(() => { evaluateBook(playerBook); });
});

// When a protected match comes back around
protectedQueue.process(parallelProcessors, (job) => {
  evalProtected(job.data.existingOffer, job.data.newOffer);
});

// Access the correct book or make one if necessary
function getBook(ContestId, NFLPlayerId) {
  if (!books[ContestId]) { books[ContestId] = {}; }
  if (!books[ContestId][NFLPlayerId]) {
    books[ContestId][NFLPlayerId] = new Book(ContestId, NFLPlayerId);
  }
  const playerBook = books[ContestId][NFLPlayerId];
  // There may be existing offers in the DB, so add them to the book
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
  return true;
}

// Check the book and iteratively try to execute matches
async function evaluateBook(playerBook) {
  let match = playerBook.evaluate();
  while (match) {
    // eslint-disable-next-line no-console
    console.log('match', match);
    // If the old offer is protected, create a protMatch
    const isBidOld = (match.bid.data.createdAt < match.ask.data.createdAt);
    const oldOffer = (isBidOld ? match.bid : match.ask);
    const newOffer = (!isBidOld ? match.bid : match.ask);
    if (oldOffer.protected) {
      await addToProtectedMatchQueue(oldOffer, newOffer);
      match = false;
    } else {
      // Otherwise try to fill the offer now
      const result = await fillOffers(match.bid.id, match.ask.id);
      // Remove filled or errored orders from the book
      if (result.bid.filled || result.bid.cancelled || result.bid.error) {
        playerBook.cancel(result.bid);
      }
      if (result.ask.filled || result.ask.cancelled || result.bid.error) {
        playerBook.cancel(result.ask);
      }
      // Check if there's another match
      match = playerBook.evaluate();
    }
  }
  // Set latest best prices
  updateBest(playerBook);
}

// Add a protMatch to the queue and send a ping
async function addToProtectedMatchQueue(eOffer, nOffer) {
  protectedQueue.add({
    existingOffer: eOffer.id,
    newOffer: nOffer.id,
  }, { delay: config.ProtectionDelay * 1000 });
  // Send ping to user
  client.publish('protectedMatch', JSON.stringify({
    userID: eOffer.data.UserId,
    offerID: eOffer.id,
    expire: Date.now() + config.ProtectionDelay * 1000,
  }));
}

// Try to fill a protected match
async function evalProtected(proffer, neoffer) {
  // Both protected and triggering offers must still exist
  // Otherwise users could trigger and cancel to make every protOffer always ready to execute
  const poffer = await Offer.findByPk(proffer).then(u.dv);
  const noffer = await Offer.findByPk(neoffer).then(u.dv);

  if (!poffer || !noffer) return false;
  const { ContestId, NFLPlayerId } = poffer;

  const playerBook = getBook(ContestId, NFLPlayerId);

  playerBook.enqueue(() => { runMatches(poffer, playerBook); });

  return false;
}

// Find possible matches for a protected offer
async function runMatches(poffer, playerBook) {
  const ispbid = poffer.isbid;

  // Find all offers that could be matched
  let matchingOfferIDs = playerBook.findProtectedMatches(poffer);
  while (matchingOfferIDs.length) {
    // Randomly chosen so no incentive to submit first
    const randomInd = Math.floor(Math.random() * matchingOfferIDs.length);
    const randomOffer = matchingOfferIDs[randomInd];
    const bidoffer = (ispbid ? poffer.id : randomOffer);
    const askoffer = (!ispbid ? poffer.id : randomOffer);

    const result = await fillOffers(bidoffer, askoffer);

    if (result.bid.filled || result.bid.cancelled || result.bid.error) {
      playerBook.cancel(result.bid);
      if (ispbid) { matchingOfferIDs = []; } else { matchingOfferIDs.splice(randomInd, 1); }
    }
    if (result.ask.filled || result.ask.cancelled || result.bid.error) {
      playerBook.cancel(result.ask);
      if (!ispbid) { matchingOfferIDs = []; } else { matchingOfferIDs.splice(randomInd, 1); }
    }
  }
  updateBest(playerBook);
}

// Send out latest price info based on book
function updateBest(playerBook) {
  playerBook.evaluate();
  const { contestID, nflplayerID } = playerBook;

  const bestbids = [playerBook.bestbid, playerBook.bestpbid].filter((e) => e);
  const bestasks = [playerBook.bestask, playerBook.bestpask].filter((e) => e);

  let bestbid = 0;
  let bestask = 0;
  if (bestbids.length === 2) bestbid = Math.max(...bestbids);
  if (bestbids.length === 1) [bestbid] = bestbids;
  if (bestasks.length === 2) bestask = Math.min(...bestasks);
  if (bestasks.length === 1) [bestask] = bestasks;

  client.hset(
    hash(contestID, nflplayerID),
    'bestbid', bestbid,
    'bestask', bestask,
  );
  client.publish('priceUpdate', JSON.stringify({
    contestID,
    nflplayerID,
    bestbid,
    bestask,
  }));
}

async function initRedisWeek() {
  const theweek = await get.CurrentWeek();
  if (!theweek) await set.CurrentWeek(1);
}
initRedisWeek();
