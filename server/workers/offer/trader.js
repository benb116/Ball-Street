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
const logger = require('../../utilities/logger');

// Try to fill the offers or return which one is done
async function fillOffers(bidid, askid, price) {
  logger.info(`begin trade: ${bidid} ${askid}`);
  const out = sequelize.transaction(isoOption,
    async (t) => attemptFill(t, bidid, askid, price));
  return out;
}

async function attemptFill(t, bidid, askid, tprice) {
  const resp = {
    bid: { id: bidid },
    ask: { id: askid },
  };
  // Check that both offers are valid
  const [bidoffer, askoffer] = await Promise.all([
    Offer.findByPk(bidid, u.tobj(t)),
    Offer.findByPk(askid, u.tobj(t)),
  ]);
  const boffer = u.dv(bidoffer);
  const aoffer = u.dv(askoffer);

  if (aoffer.price > boffer.price) throw new Error('Price mismatch');

  resp.bid = (boffer || {});
  resp.ask = (aoffer || {});

  if (!boffer || boffer.filled || boffer.cancelled || !boffer.isbid) {
    resp.bid.closed = true;
  }
  if (!aoffer || aoffer.filled || aoffer.cancelled || aoffer.isbid) {
    resp.ask.closed = true;
  }
  if (resp.bid.closed || resp.ask.closed) {
    logger.info(`Offer began closed: ${JSON.stringify(resp)}`);
    return resp;
  }

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
      logger.warn(`Offer could not be filled: ${boffer.id} - ${err.message}`);
      Offer.destroy({ where: { id: boffer.id } })
        .then(() => {
          client.publish('offerCancelled', JSON.stringify({
            userID: boffer.UserId,
            offerID: boffer.id,
          }));
        }).finally(() => false);
    });
  const askProm = service.tradeDrop(askreq, t)
    .catch((err) => {
      logger.warn(`Offer could not be filled: ${aoffer.id} - ${err.message}`);
      Offer.destroy({ where: { id: aoffer.id } })
        .then(() => {
          client.publish('offerCancelled', JSON.stringify({
            userID: aoffer.UserId,
            offerID: aoffer.id,
          }));
        }).finally(() => false);
    });

  // Check the response
  const out = await Promise.all([bidProm, askProm]);
  resp.bid.closed = !out[0];
  resp.ask.closed = !out[1];

  if (resp.bid.closed || resp.ask.closed) {
    logger.info(`Offer ended closed: ${JSON.stringify(resp)}`);
    return resp;
  }
  // If both good, commit transaction
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
  logger.info(`finish trade - ${price}: ${bidid} ${askid}`);
  return {
    bid: bidoffer,
    ask: askoffer,
  };
}

module.exports = {
  fillOffers,
  attemptFill,
};
