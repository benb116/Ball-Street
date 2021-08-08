/* eslint-disable no-console */
// Trade functions
// Used by offer worker
// Try to fill a pair of offers

const u = require('../../features/util/util');

const sequelize = require('../../db');
const { Offer, Trade, PriceHistory } = require('../../models');
// const { Transaction } = require('sequelize');
const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const { client, rediskeys } = require('../../db/redis');

const { hash } = rediskeys;

const service = require('../../features/trade/trade.service');

// Try to fill the offers or return which one is done
async function fillOffers(bidid, askid, price) {
  console.log('begin trade:', bidid, askid);
  const out = sequelize.transaction(isoOption,
    async (t) => attemptFill(t, bidid, askid, price));
  return out;
}

async function attemptFill(t, bidid, askid, tprice) {
  const resp = {
    bid: { id: bidid },
    ask: { id: askid },
  };
  const [bidoffer, askoffer] = await Promise.all([
    Offer.findByPk(bidid, u.tobj(t)),
    Offer.findByPk(askid, u.tobj(t)),
  ]);
  const boffer = u.dv(bidoffer);
  const aoffer = u.dv(askoffer);

  resp.bid = boffer;
  resp.ask = aoffer;

  if (!boffer || boffer.filled || boffer.cancelled || !boffer.isbid) {
    resp.bid.closed = true;
  }
  if (!aoffer || aoffer.filled || aoffer.cancelled || aoffer.isbid) {
    resp.ask.closed = true;
  }
  if (resp.bid.closed || resp.ask.closed) return resp;

  const biduser = boffer.UserId;
  const askuser = aoffer.UserId;
  const nflplayerID = boffer.NFLPlayerId;

  let price = tprice;
  if (!tprice) {
    price = (boffer.createdAt < aoffer.createdAt ? boffer.price : aoffer.price);
  }

  const bidreq = {
    user: biduser,
    params: { contestID: boffer.ContestId },
    body: {
      nflplayerID,
      price,
    },
  };
  const askreq = {
    user: askuser,
    params: { contestID: aoffer.ContestId },
    body: {
      nflplayerID,
      price,
    },
  };

  // Try to fill both
  const bidProm = service.tradeAdd(bidreq, t)
    .catch((err) => {
      if (err.status === 402) { // Not enough points
        return Offer.destroy({ where: { id: boffer.id } })
          .then(() => {
            client.publish('offerCancelled', JSON.stringify({
              userID: boffer.UserId,
              offerID: boffer.id,
            }));
            return false;
          }).catch(() => false);
      }
      return false;
    });
  const askProm = service.tradeDrop(askreq, t)
    .catch((err) => {
      if (err.status === 402) { // Not enough points
        return Offer.destroy({ where: { id: aoffer.id } })
          .then(() => {
            client.publish('offerCancelled', JSON.stringify({
              userID: aoffer.UserId,
              offerID: aoffer.id,
            }));
            return false;
          }).catch(() => false);
      }
      return false;
    });

  const out = await Promise.all([bidProm, askProm]);
  resp.bid.closed = !out[0];
  resp.ask.closed = !out[1];

  if (resp.bid.closed || resp.ask.closed) return resp;

  bidoffer.filled = true;
  askoffer.filled = true;

  await Promise.all([
    bidoffer.save({ transaction: t }),
    askoffer.save({ transaction: t }),
  ]);

  // Trade completed, record it and notify

  const createTrade = Trade.create({
    bidId: boffer.id,
    askId: aoffer.id,
    price,
  }, u.tobj(t));

  const contestID = boffer.ContestId;

  const createHistory = PriceHistory.create({
    ContestId: contestID,
    NFLPlayerId: nflplayerID,
    lastTradePrice: price,
  }, u.tobj(t));

  await Promise.all([createTrade, createHistory]);

  client.hmset(hash(contestID, nflplayerID), 'lastprice', price);
  client.publish('lastTrade', JSON.stringify({
    contestID,
    nflplayerID,
    lastprice: price,
  }));
  client.publish('offerFilled', JSON.stringify({
    userID: boffer.UserId,
    offerID: boffer.id,
  }));
  client.publish('offerFilled', JSON.stringify({
    userID: aoffer.UserId,
    offerID: aoffer.id,
  }));
  console.log('finish trade', price);
  return {
    bid: bidoffer,
    ask: askoffer,
  };
}

module.exports = {
  fillOffers,
  attemptFill,
};
