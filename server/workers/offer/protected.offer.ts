import logger from '../../utilities/logger';

import Book from './book.offer';
import { updateBest } from './util.offer';
import fillOffers from './trader.offer';

import Offer from '../../features/offer/offer.model';

/** Try to fill a protected match */
async function evalProtected(playerBook: Book, proffer: string, neoffer: string) {
  const poffer = await Offer.findByPk(proffer);
  if (!poffer) {
    logger.info(`Matchee unavailable ${proffer}`);
    await playerBook.unmatch({ id: proffer });
    return;
  }
  if (poffer.cancelled || poffer.filled) {
    logger.info(`Matchee unavailable ${poffer.id}`);
    await playerBook.unmatch(poffer);
    return;
  }

  // Matching offer must not have been cancelled
  // Otherwise users could trigger and immediately cancel
  // to make every protOffer always ready to execute
  const noffer = await Offer.findByPk(neoffer);
  if (!noffer) {
    logger.info(`Matcher unavailable ${neoffer}`);
    await playerBook.unmatch({ id: proffer });
    return;
  }
  if (noffer.cancelled) {
    logger.info(`Matcher unavailable ${noffer.id}`);
    await playerBook.unmatch(poffer);
    return;
  }

  await runMatches(poffer, playerBook);
}

/**
 * Find possible matches for a protected offer.
 * Run through them to try to match with the current one.
 */
async function runMatches(poffer: Offer, playerBook: Book) {
  const ispbid = poffer.isbid;
  // Find all offers that could be matched
  let matchingOffers = playerBook.findProtectedMatches(poffer);
  logger.verbose(`Random protected matches ${poffer.id}: ${matchingOffers.length}`);
  while (matchingOffers.length) {
    // Randomly chosen so no incentive to submit first
    const randomInd = Math.floor(Math.random() * matchingOffers.length);
    const randomOffer = matchingOffers[randomInd];
    if (!randomOffer) break;
    logger.verbose(`Try to fill ${randomOffer.id}`);
    const bidoffer = (ispbid ? poffer.id : randomOffer.id);
    const askoffer = (!ispbid ? poffer.id : randomOffer.id);

    // eslint-disable-next-line no-await-in-loop
    const result = await fillOffers(bidoffer, askoffer);

    if (!result.bid || result.bid.filled || result.bid.cancelled) {
      if (ispbid) {
        playerBook.cancel(poffer);
        matchingOffers = [];
      } else {
        playerBook.cancel(randomOffer);
        matchingOffers.splice(randomInd, 1);
      }
    }
    if (!result.ask || result.ask.filled || result.ask.cancelled) {
      if (!ispbid) {
        playerBook.cancel(poffer);
        matchingOffers = [];
      } else {
        playerBook.cancel(randomOffer);
        matchingOffers.splice(randomInd, 1);
      }
    }
  }

  await playerBook.unmatch(poffer);
  playerBook.evaluate();
  updateBest(playerBook);
}

export default evalProtected;
