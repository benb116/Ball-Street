/* eslint-disable no-console */
// Trade functions
// Used by offer worker
// Try to fill a pair of offers

const u = require('../features/util/util');

const sequelize = require('../db');
const { Offer, Trade, PriceHistory } = require('../models');
// const { Transaction } = require('sequelize');
const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const { client, rediskeys } = require('../db/redis');

const { hash } = rediskeys;

const service = require('../features/trade/trade.service');

// Try to fill the offers or return which one is done
async function fillOffers(bidid, askid, price) {
  console.log('begin:', bidid, askid);
  const out = sequelize.transaction(isoOption,
    async (t) => attemptFill(t, bidid, askid, price))
    .catch((err) => {
      switch (err) {
        case 'bid':
          console.log('bid err');
          return [1, 0];
        case 'ask':
          console.log('ask err');
          return [0, 1];
        case 'both':
          console.log('both err');
          return [1, 1];
        default:
          console.log('fill', err);
          return [1, 1];
      }
    });
  return out;
}

async function attemptFill(t, bidid, askid, tprice) {
  const resp = [0, 0];

  const [bidoffer, askoffer] = Promise.all([
    Offer.findByPk(bidid, u.tobj(t)),
    Offer.findByPk(askid, u.tobj(t)),
  ]);
  const boffer = u.dv(bidoffer);
  const aoffer = u.dv(askoffer);

  if (!boffer.isbid) { console.log('bid not bid', boffer); throw new Error('bidoffer is not a bid'); }
  if (aoffer.isbid) { console.log('ask not ask', aoffer); throw new Error('askoffer is not a ask'); }

  if (!boffer || boffer.filled || boffer.cancelled) {
    console.log('no bid', bidid);
    resp[0] = 1;
  }
  if (!aoffer || aoffer.filled || aoffer.cancelled) {
    console.log('no ask', askid);
    resp[1] = 1;
  }
  if (resp[0] === 1 && resp[1] === 1) { throw new Error('both'); }
  if (resp[0] === 1) { throw new Error('bid'); }
  if (resp[1] === 1) { throw new Error('ask'); }

  console.log('past initial');
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
        return Offer.destroy({
          where: {
            id: boffer.id,
          },
        }).then(() => {
          client.publish('offerCancelled', JSON.stringify({
            userID: boffer.UserId,
            offerID: boffer.id,
          }));
          return 1;
        }).catch(() => 1);
      }
      return 1;
    });
  const askProm = service.tradeDrop(askreq, t)
    .catch((err) => {
      if (err.status === 402) { // Not enough points
        return Offer.destroy({
          where: {
            id: aoffer.id,
          },
        }).then(() => {
          client.publish('offerCancelled', JSON.stringify({
            userID: aoffer.UserId,
            offerID: aoffer.id,
          }));
          return 1;
        }).catch(() => 1);
      }
      return 1;
    });

  const [biddone, askdone] = await Promise.all([bidProm, askProm]);
  if (Number(biddone) && Number(askdone)) { throw new Error('both'); }
  if (Number(biddone)) { throw new Error('bid'); }
  if (Number(askdone)) { throw new Error('ask'); }

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
  return [1, 1];
}

module.exports = {
  fillOffers,
  attemptFill,
};
