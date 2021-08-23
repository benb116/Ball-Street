const u = require('../../features/util/util');

const { Offer } = require('../../models');
const { updateBest } = require('./offer.util');
const { fillOffers } = require('./trader');

// Try to fill a protected match
async function evalProtected(playerBook, proffer, neoffer) {
  const poffer = await Offer.findByPk(proffer).then(u.dv);
  if (!poffer || poffer.cancelled || poffer.filled) {
    await playerBook.unmatch(proffer);
    return false;
  }

  // Matching offer must not have been cancelled
  // Otherwise users could trigger and immediately cancel
  // to make every protOffer always ready to execute
  const noffer = await Offer.findByPk(neoffer).then(u.dv);
  if (!noffer || noffer.cancelled) {
    await playerBook.unmatch(proffer);
    return false;
  }

  runMatches(poffer, playerBook);

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

    // eslint-disable-next-line no-await-in-loop
    const result = await fillOffers(bidoffer, askoffer);

    if (result.bid.filled || result.bid.cancelled || result.bid.error) {
      playerBook.cancel(result.bid);
      if (ispbid) {
        matchingOfferIDs = [];
      } else {
        matchingOfferIDs.splice(randomInd, 1);
      }
    }
    if (result.ask.filled || result.ask.cancelled || result.bid.error) {
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

module.exports = evalProtected;
