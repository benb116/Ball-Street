import { dv } from '../../features/util/util';
import logger from '../../utilities/logger';

import Book from './book.offer';
import { updateBest } from './util.offer';
import fillOffers from './trader.offer';

import Offer, { OfferType } from '../../features/offer/offer.model';

// Try to fill a protected match
async function evalProtected(playerBook: Book, proffer: string, neoffer: string) {
  const poffer: OfferType = await Offer.findByPk(proffer).then(dv);
  if (!poffer || poffer.cancelled || poffer.filled) {
    logger.info(`Matchee unavailable ${poffer.id}`);
    await playerBook.unmatch(poffer);
    return false;
  }

  // Matching offer must not have been cancelled
  // Otherwise users could trigger and immediately cancel
  // to make every protOffer always ready to execute
  const noffer: OfferType = await Offer.findByPk(neoffer).then(dv);
  if (!noffer || noffer.cancelled) {
    logger.info(`Matcher unavailable ${noffer.id}`);
    await playerBook.unmatch(poffer);
    return false;
  }

  runMatches(poffer, playerBook);

  return false;
}

// Find possible matches for a protected offer
async function runMatches(poffer: OfferType, playerBook: Book) {
  const ispbid = poffer.isbid;
  // Find all offers that could be matched
  let matchingOfferIDs = playerBook.findProtectedMatches(poffer);
  logger.verbose(`Random protected matches ${poffer.id}`);
  while (matchingOfferIDs.length) {
    // Randomly chosen so no incentive to submit first
    const randomInd = Math.floor(Math.random() * matchingOfferIDs.length);
    const randomOffer = matchingOfferIDs[randomInd];
    logger.verbose(`Try to fill ${randomOffer}`);
    const bidoffer = (ispbid ? poffer.id : randomOffer);
    const askoffer = (!ispbid ? poffer.id : randomOffer);

    // eslint-disable-next-line no-await-in-loop
    const result = await fillOffers(bidoffer, askoffer);

    if (result.bid.filled || result.bid.cancelled) {
      playerBook.cancel(result.bid);
      if (ispbid) {
        matchingOfferIDs = [];
      } else {
        matchingOfferIDs.splice(randomInd, 1);
      }
    }
    if (result.ask.filled || result.ask.cancelled) {
      playerBook.cancel(result.ask);
      if (!ispbid) {
        matchingOfferIDs = [];
      } else {
        matchingOfferIDs.splice(randomInd, 1);
      }
    }
  }

  await playerBook.unmatch(poffer);
  playerBook.evaluate();
  updateBest(playerBook);
}

export default evalProtected;