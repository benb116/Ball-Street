// Offer server worker
// Processes jobs on the offer queue
// Tries to reduce order book whenever an offer comes in
// Sends out matches to be filled

const Queue = require('bull');
const redis = require('redis');
const { Op } = require('sequelize');
const u = require('../features/util/util');
const config = require('../config');
const { hashkey } = require('../db/redisSchema');

const client = redis.createClient();

const offerQueue = new Queue('offer-queue');
const protectedQueue = new Queue('protected-queue');

const { Offer } = require('../models');
const { fillOffers } = require('./trade.worker');

offerQueue.process(async (job) => {
  console.log('\r\nNew Job', job.data.id);
  await evalOrderBook(job.data.ContestId, job.data.NFLPlayerId);
});

// Evaluate the order book for a player in a contest
async function evalOrderBook(contestID, nflplayerID) {
  // Get all outstanding offers (sorted)
  Promise.all([
    findSortOffers(contestID, nflplayerID, true),
    findSortOffers(contestID, nflplayerID, false),
  ])
    // Iterate through and try to match
    .then(([bids, asks]) => compareBidsAsks(bids, asks))
    // Output results
    .then(([nextbid, nextask]) => {
      const bestbid = (nextbid ? nextbid.price : NaN);
      const bestask = (nextask ? nextask.price : NaN);
      client.hset(hashkey(contestID, nflplayerID), 'bestbid', bestbid, 'bestask', bestask);
      client.publish('priceUpdate', JSON.stringify({
        contestID,
        nflplayerID,
        bestbid,
        bestask,
      }));
    });
  // .then(console.log);
}

// Find highest bids and lowest asks
// Give priority to unprotected and older offers
async function findSortOffers(contestID, nflplayerID, isbid) {
  const priceSort = (isbid ? 'DESC' : 'ASC');
  const possibleMatches = Offer.findAll({
    where: {
      ContestId: contestID,
      NFLPlayerId: nflplayerID,
      isbid,
      filled: false,
      cancelled: false,
    },
    order: [
      ['price', priceSort],
      ['protected', 'ASC'],
      ['updatedAt', 'ASC'],
    ],
  }).then(u.dv);
  return possibleMatches;
}

// Try to match the "heads" of bids and asks
// Based on output, update the heads and do it again
// When there's no match at the heads, stop
async function compareBidsAsks(bids, asks, bidind = 0, askind = 0) {
  console.log('bidaskind', bidind, askind, bids.length, asks.length);
  if (!bids[bidind] || !asks[askind]) {
    console.log('EOL');
    const player = (bids[0] ? bids[0].NFLPlayerId : (asks[0] ? asks[0].NFLPlayerId : 0));
    return [bids[bidind], bids[askind]];
  } if (bids[bidind].price >= asks[askind].price) {
    const [nextbid, nextask] = await matchOffers(bids[bidind], asks[askind]);
    if (nextbid || nextask) {
      return compareBidsAsks(bids, asks, bidind + nextbid, askind + nextask);
    }
  } else {
    console.log('PriceMismatch');
    return [bids[bidind], bids[askind]];
  }
}

// Try to match two offers
// If unprotected, try to trade now
// If protected, add to protected queue
async function matchOffers(bid, ask) {
  const isBidOld = (bid.createdAt < ask.createdAt);
  const oldOffer = (isBidOld ? bid : ask);
  const newOffer = (!isBidOld ? bid : ask);
  const isOldProtected = oldOffer.protected;
  let nextind = [];

  if (!isOldProtected) {
    // Try to trade rn
    nextind = await initTrade(bid, ask);
  } else {
    // Add delayed to protected queue
    await addToProtectedMatchQueue(oldOffer, newOffer);
    nextind = [Number(!isBidOld), Number(isBidOld)];
  }
  console.log('nextind', nextind);
  return nextind;
}

async function initTrade(bid, ask, price) {
  return fillOffers(bid.id, ask.id, price);
}

// Comes back after N seconds
async function addToProtectedMatchQueue(eOffer, nOffer) {
  console.log('protected', eOffer.id, nOffer.id);
  protectedQueue.add({
    existingOffer: eOffer.id,
    newOffer: nOffer.id,
    isExistingBid: eOffer.isbid,
  }, { delay: config.ProtectionDelay * 1000 });
  // Send ping to user
  client.publish('protectedMatch', JSON.stringify({
    userID: eOffer.UserId,
    offerID: eOffer.id,
  }));
  return 1;
}

//
protectedQueue.process(async (job) => {
  console.log('job');
  await findProtectedMatches(job.data.existingOffer, job.data.isExistingBid);
});

async function findProtectedMatches(proffer, ispbid) {
  const poffer = await Offer.findByPk(proffer).then(u.dv);
  const contestID = poffer.ContestId;
  const nflplayerID = poffer.NFLPlayerId;
  const findbids = !ispbid;

  let priceobj = {};
  if (findbids) {
    priceobj = { [Op.gte]: poffer.price };
  } else {
    priceobj = { [Op.lte]: poffer.price };
  }

  await Offer.findAll({
    where: {
      ContestId: contestID,
      NFLPlayerId: nflplayerID,
      isbid: findbids,
      filled: false,
      cancelled: false,
      price: priceobj,
    },
  })
    .then(u.dv)
    .then(async (offers) => {
      while (offers.length) {
        const randomInd = Math.floor(Math.random() * offers.length);
        const randomOffer = offers[randomInd];
        const bidoffer = (ispbid ? poffer : randomOffer);
        const askoffer = (!ispbid ? poffer : randomOffer);
        // eslint-disable-next-line no-await-in-loop
        const out = await fillOffers(bidoffer.id, askoffer.id);
        // if out[!ispbid] is 1, then the protected offer was filled or errored
        if (out[Number(!ispbid)]) { break; }
        if (out[ispbid]) { // There was something wrong with the matching offer, get new random
          offers.splice(randomInd, 1);
        }
      }
    })
    .catch(console.log);
}
