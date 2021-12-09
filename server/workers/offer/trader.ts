// Trade functions
// Used by offer worker
// Try to fill a pair of offers

import { Transaction } from 'sequelize';
import { dv, tobj } from '../../features/util/util';

import sequelize from '../../db';
import { Offer, Trade, PriceHistory } from '../../models';

import { rediskeys, client } from '../../db/redis';

import logger from '../../utilities/logger';
import channels from '../live/channels.live';
import tradeAdd from '../../features/trade/services/tradeAdd.service';
import tradeDrop from '../../features/trade/services/tradeDrop.service';

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const { offerFilled, priceUpdate, offerCancelled } = channels;

// Try to fill the offers or return which one is done
async function fillOffers(bidid: string, askid: string, price = false) {
  logger.info(`begin trade: ${bidid} ${askid}`);
  const out = sequelize.transaction(isoOption,
    async (t) => attemptFill(t, bidid, askid, price));
  return out;
}

async function attemptFill(t: Transaction, bidid: string, askid: string, tprice: boolean) {
  const resp = {
    bid: { id: bidid, closed: false },
    ask: { id: askid, closed: false },
  };
  // Check that both offers are valid
  const [bidoffer, askoffer] = await Promise.all([
    Offer.findByPk(bidid, tobj(t)),
    Offer.findByPk(askid, tobj(t)),
  ]);
  const boffer = dv(bidoffer);
  const aoffer = dv(askoffer);

  resp.bid = (boffer || {});
  resp.ask = (aoffer || {});

  if (!boffer || boffer.filled || boffer.cancelled || !boffer.isbid) {
    resp.bid.closed = true;
  }
  if (!aoffer || aoffer.filled || aoffer.cancelled || aoffer.isbid) {
    resp.ask.closed = true;
  }
  if (resp.bid.closed || resp.ask.closed || !bidoffer || !askoffer) {
    logger.info(`Offer began closed: ${JSON.stringify(resp)}`);
    return resp;
  }

  if (aoffer.price > boffer.price) throw new Error('Price mismatch');

  const biduser = boffer.UserId;
  const askuser = aoffer.UserId;
  const nflplayerID = boffer.NFLPlayerId;

  let price = Number(tprice);
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
  const bidProm = tradeAdd(bidreq, t)
    .catch((err) => {
      logger.warn(`Offer could not be filled: ${boffer.id} - ${err.message}`);
      return Offer.destroy({ where: { id: boffer.id } }, { transaction: t })
        .then(() => offerCancelled.pub(boffer.UserId, boffer.id)).finally(() => false);
    });
  const askProm = tradeDrop(askreq, t)
    .catch((err) => {
      logger.warn(`Offer could not be filled: ${aoffer.id} - ${err.message}`);
      return Offer.destroy({ where: { id: aoffer.id } }, { transaction: t })
        .then(() => offerCancelled.pub(aoffer.UserId, aoffer.id)).finally(() => false);
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
  }, tobj(t));

  const contestID = boffer.ContestId;

  const createHistory = PriceHistory.create({
    ContestId: contestID,
    NFLPlayerId: nflplayerID,
    lastTradePrice: price,
  }, tobj(t));

  await Promise.all([createTrade, createHistory]);

  client.HSET(rediskeys.lasttradeHash(contestID), [nflplayerID.toString(), price.toString()]);
  priceUpdate.pub('last', contestID, nflplayerID, price);
  offerFilled.pub(boffer.UserId, boffer.id);
  offerFilled.pub(aoffer.UserId, aoffer.id);
  logger.info(`finish trade - ${price}: ${bidid} ${askid}`);
  return {
    bid: bidoffer,
    ask: askoffer,
  };
}

export default fillOffers;
