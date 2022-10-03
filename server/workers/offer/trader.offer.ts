// Trade functions
// Used by offer worker
// Try to fill a pair of offers

import { Transaction } from 'sequelize';

import { tobj } from '@features/util/util';
import logger from '@server/utilities/logger';

import sequelize from '@db';

import tradeAdd from '@features/trade/services/tradeAdd.service';
import tradeDrop from '@features/trade/services/tradeDrop.service';

import Offer from '@features/offer/offer.model';
import Trade from '@features/trade/trade.model';
import PriceHistory from '@features/pricehistory/pricehistory.model';
import lasttrade from '@db/redis/lasttrade.redis';
import channels from '../live/channels.live';

const { offerFilled, priceUpdate, offerCancelled } = channels;

// Try to fill the offers or return which one is done
async function fillOffers(bidid: string, askid: string) {
  logger.info(`begin trade: ${bidid} ${askid}`);
  const out = sequelize.transaction(async (t) => attemptFill(t, bidid, askid));
  return out;
}

async function attemptFill(t: Transaction, bidid: string, askid: string) {
  let isBidClosed = false;
  let isAskClosed = false;
  // Check that both offers are valid
  const [bidoffer, askoffer] = await Promise.all([
    Offer.findByPk(bidid, tobj(t)),
    Offer.findByPk(askid, tobj(t)),
  ]);

  if (!bidoffer || !askoffer) {
    logger.info(`Offer not found: ${(!bidoffer ? bidid : askid)}`);
    return {
      bid: bidoffer,
      ask: askoffer,
    };
  }

  const resp = {
    bid: bidoffer,
    ask: askoffer,
  };

  if (bidoffer.filled || bidoffer.cancelled || !bidoffer.isbid) {
    isBidClosed = true;
  }
  if (askoffer.filled || askoffer.cancelled || askoffer.isbid) {
    isAskClosed = true;
  }
  if (isBidClosed || isAskClosed || !bidoffer || !askoffer) {
    logger.info(`Offer began closed: ${JSON.stringify(resp)}`);
    return resp;
  }

  if (askoffer.price > bidoffer.price) throw new Error('Price mismatch');
  if (askoffer.ContestId !== bidoffer.ContestId) throw new Error('Contest mismatch');
  if (askoffer.NFLPlayerId !== bidoffer.NFLPlayerId) throw new Error('Player mismatch');

  const biduser = bidoffer.UserId;
  const askuser = askoffer.UserId;
  const nflplayerID = bidoffer.NFLPlayerId;

  const price = (bidoffer.createdAt < askoffer.createdAt ? bidoffer.price : askoffer.price);

  const bidreq = {
    user: biduser,
    params: { contestID: bidoffer.ContestId },
    body: {
      nflplayerID,
      price,
    },
  };
  const askreq = {
    user: askuser,
    params: { contestID: askoffer.ContestId },
    body: {
      nflplayerID,
      price,
    },
  };

  // Try to fill both
  const bidProm = tradeAdd(bidreq, t)
    .catch(async (err) => {
      logger.warn(`Offer could not be filled: ${bidoffer.id} - ${err.message}`);
      bidoffer.cancelled = true;
      await bidoffer.save({ transaction: t });
      offerCancelled.pub(bidoffer.UserId, bidoffer.id);
      return false;
    });

  const askProm = tradeDrop(askreq, t)
    .catch(async (err) => {
      logger.warn(`Offer could not be filled: ${askoffer.id} - ${err.message}`);
      askoffer.cancelled = true;
      await askoffer.save({ transaction: t });
      offerCancelled.pub(askoffer.UserId, askoffer.id);
      return false;
    });

  // Check the response
  const out = await Promise.all([bidProm, askProm]);
  isBidClosed = !out[0];
  isAskClosed = !out[1];
  resp.bid.cancelled = isBidClosed;
  resp.ask.cancelled = isAskClosed;

  if (isBidClosed || isAskClosed) {
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
    bidId: bidoffer.id,
    askId: askoffer.id,
    price,
  }, tobj(t));

  const contestID = bidoffer.ContestId;

  const createHistory = PriceHistory.create({
    ContestId: contestID,
    NFLPlayerId: nflplayerID,
    lastTradePrice: price,
  }, tobj(t));

  await Promise.all([createTrade, createHistory]);

  lasttrade.set(contestID, nflplayerID, price);
  priceUpdate.pub('last', contestID, nflplayerID, price);
  offerFilled.pub(bidoffer.UserId, bidoffer.id);
  offerFilled.pub(askoffer.UserId, askoffer.id);
  logger.info(`finish trade - ${price}: ${bidid} ${askid}`);
  return resp;
}

export default fillOffers;
