/* eslint-disable no-await-in-loop */
// Offer server worker
// Processes jobs on the offer queue
// Tries to reduce order book whenever an offer comes in
// Sends out matches to be filled
const Queue = require('bull');
const config = require('../config');
const Book = require('./offer/book.class');

const u = require('../features/util/util');

const { queueOptions, client, rediskeys } = require('../db/redis');

const { hash } = rediskeys;

const offerQueue = new Queue('offer-queue', queueOptions);
const protectedQueue = new Queue('protected-queue', queueOptions);

const { Offer } = require('../models');
const { fillOffers } = require('./offer/trader');

const playerBook = new Book(1, 20933);

startUp();

async function startUp() {
  await initializeBook(1, 20933);

  offerQueue.process(async (job) => {
    const { ContestId, NFLPlayerId } = job.data;
    if (job.data.cancelled) { playerBook.cancel(job.data); } else playerBook.add(job.data);
    evaluateBook(ContestId, NFLPlayerId);
  });

  protectedQueue.process(async (job) => {
    await evalProtected(job.data.existingOffer, job.data.newOffer);
  });
}

// Generate the book based on existing offers in DB
async function initializeBook(contestID, nflplayerID) {
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
  evaluateBook(contestID, nflplayerID);
  return true;
}

// Check the book and iteratively try to execute matches
async function evaluateBook(contestID, nflplayerID) {
  let match = playerBook.evaluate();
  while (match) {
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
  updateBest(contestID, nflplayerID);
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

  const ispbid = poffer.isbid;

  // Find all offers that could be matched
  let matchingOfferIDs = playerBook.findProtectedMatches(poffer);
  while (matchingOfferIDs.length) {
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
  updateBest(ContestId, NFLPlayerId);
  return false;
}

function updateBest(contestID, nflplayerID) {
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
