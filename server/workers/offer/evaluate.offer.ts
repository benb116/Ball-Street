/* eslint-disable no-param-reassign */
// Find the match with the highest priority that can be made
// Returns false for no matches

import logger from '../../utilities/logger';

import type Book from './book.offer';

import { OfferType } from '../../features/offer/offer.model';

export interface MatchPair {
  bid: OfferType,
  ask: OfferType
}

// Returns with a bid and ask object detailing the offers
function evaluateFn(book: Book) {
  // Get all prices that are being offered
  const bidPrices = Object.keys(book.bid).map(Number);
  const pbidPrices = Object.keys(book.pbid).map(Number);
  const askPrices = Object.keys(book.ask).map(Number);
  const paskPrices = Object.keys(book.pask).map(Number);

  // Get best prices and mark to the book for caching
  book.bestbid = Math.max(...bidPrices);
  book.bestpbid = Math.max(...pbidPrices);
  book.bestask = Math.min(...askPrices);
  book.bestpask = Math.min(...paskPrices);

  if (book.bestbid === -Infinity) { book.bestbid = null; }
  if (book.bestpbid === -Infinity) { book.bestpbid = null; }
  if (book.bestask === Infinity) { book.bestask = null; }
  if (book.bestpask === Infinity) { book.bestpask = null; }

  logger.verbose(
    `${book.contestID}-${book.nflplayerID} Evaluated prices: ${
      [book.bestbid, book.bestask, book.bestpbid, book.bestpask].map((p) => p || 0).join(' ')
    }`,
  );

  // Priority is given to unprotected offers
  // Try to match bid with ask
  // then bid with protask
  // then protbid with ask
  // and last protbid with protask

  // Try to match the best bid first
  if (book.bestbid) {
    const match = findMatchForBestBid(book);
    if (match) return match;
  }
  if (book.bestpbid) {
    const match = findMatchForBestPBid(book);
    if (match) return match;
  }

  // if nothing, return false;
  return false as const;
}

function findMatchForBestBid(book: Book) {
  const bidPrices = Object.keys(book.bid).map(Number);
  // Best offer of each type that is ready to match
  let bestbidOffer;
  let bestaskOffer;
  let bestpaskOffer;

  let evalbid = Number(book.bestbid);
  let done = false; // flag, done looking at unprot bids, check prot bids next

  // Each map has an iterator that will spit out entries oldest first
  // Keep track of the iterator of the current best price for bids
  let bidIterator = book.bid[evalbid].entries();

  // Iterate through the map(s) to find the best offer
  while (!done) {
    bestbidOffer = bidIterator.next().value;
    // If none, we've exhausted a specific price level
    // Move to the next best price and try again
    if (!bestbidOffer) {
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      evalbid = Math.min(...bidPrices.filter((p) => p > evalbid));
      // If there are no more left, then exit this loop and go to pbids
      if (evalbid === Infinity) {
        done = true;
        break;
      }

      logger.verbose(`next best bid price: ${evalbid}`);
      bidIterator = book.bid[evalbid].entries();
    } else {
      // We've found the best bid
      // First try to find a matching ask
      if (book.bestask && evalbid >= book.bestask) {
        logger.verbose('found bid + ask');
        bestaskOffer = book.ask[book.bestask].entries().next().value;
        return {
          bid: { ...bestbidOffer[1], protected: false },
          ask: { ...bestaskOffer[1], protected: false },
        } as MatchPair;
      }

      // If that falls through, find an unmatched protected ask
      // but only if this bid has not matched a protask
      // since we don't want an offer to match multiple protoffers
      // Search through values (matchers) of the protMatchMap
      if (!findMatchee(book, bestbidOffer[0])) {
        // try to find a un/prot match and return
        bestpaskOffer = bestUnmatchedProtAsk(book);
        if (bestpaskOffer && evalbid >= bestpaskOffer[1].price) {
          logger.verbose('found bid + pask');
          return {
            bid: { ...bestbidOffer[1], protected: false },
            ask: { ...bestpaskOffer[1], protected: true },
          } as MatchPair;
        }
        // If we've gotten to this point with no matches,
        // we can't match this bid with anything
        // and all worse bids will also fail since they have worse prices
        done = true;
        logger.verbose('exhausted bids');
      }
      // At this point, it's possible that the next best bid could match a protask
      // if it hasn't done so already. Cycle through and check again
    }
  }
  return false;
}

function findMatchForBestPBid(book: Book) {
  const pbidPrices = Object.keys(book.pbid).map(Number);
  // Best offer of each type that is ready to match
  let bestaskOffer;
  let bestpbidOffer;
  let bestpaskOffer;

  // Try to match the best pbid next
  let evalpbid = Number(book.bestpbid);
  let done = false; // done looking at prot bid
  let pbidIterator = book.pbid[evalpbid].entries();

  // Iterate through the map(s) to find the best offer
  while (!done) {
    bestpbidOffer = pbidIterator.next().value;
    // If none, we've exhausted a specific price level
    // Move to the next best price and try again
    if (!bestpbidOffer) {
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      evalpbid = Math.min(...pbidPrices.filter((p) => p > evalpbid));
      // If there are no more left, then exit
      if (evalpbid === Infinity) {
        done = true;
        break;
      }
      logger.verbose(`next best pbid price: ${evalpbid}`);

      pbidIterator = book.pbid[evalpbid].entries();
    } else if (!(bestpbidOffer[0] in book.protMatchMap)) {
      // ^^^^^^^^^^^^^^^^^^^^^^^^^
      // We've found the best pbid
      // Next steps depends on whether this offer has matched/been matched before

      // If was matched already, must skip
      // Either matched by ask (which gets priority over other ask or pask)
      // Or matched by pask, which means that when this pbid was matched, there were
      // no ask offers that could match it. Any asks that could match it now are newer,
      // so they should not protmatch an already protmatched offer

      // ^ one note: it's possible that there could be an ask
      // that could match it that gets ignored:
      // 1 other pbid offered
      // 2 ask offered that matches 1
      // 3 this pbid offered that would match 2 but doesn't cause it matched 1 already
      // 4 ask that matches 3
      // 1 is cancelled, leaving 2 alone
      // ^ this scenario is fine, because 2 will be included in the random drawing for 3
      // What if 4 never comes?

      // If this pbid hasn't been matched yet, try ask, then pask

      // First try to find a matching ask that hasn't matched another pbid
      bestaskOffer = bestUnmatchedAsk(book);
      if (bestaskOffer) {
        if (bestaskOffer[1] && evalpbid >= bestaskOffer[1].price) {
          logger.verbose('found pbid + ask');
          return {
            bid: { ...bestpbidOffer[1], protected: true },
            ask: { ...bestaskOffer[1], protected: false },
          } as MatchPair;
        }
      }

      // If that falls through, find an unmatched protected ask
      // that has also not matched a different pbid
      // but only if this bid has not matched a pask before
      if (!findMatchee(book, bestpbidOffer[0])) {
        bestpaskOffer = bestUnmatchedProtAsk(book, true);
        if (bestpaskOffer && evalpbid >= bestpaskOffer[1].price) {
          logger.verbose('found pbid + pask');
          return {
            bid: { ...bestpbidOffer[1], protected: true },
            ask: { ...bestpaskOffer[1], protected: true },
          } as MatchPair;
        }
        // If we've gotten to this point with no matches,
        // we can't match this bid with anything
        // and all worse bids will also fail
        done = true;
      }
    }
  }
  return false;
}

function findMatchee(book: Book, id: string) {
  return Object.keys(book.protMatchMap).find((key) => book.protMatchMap[key] === id);
}

// Find the best unmatched ask offer available
function bestUnmatchedAsk(book: Book) {
  if (!book.bestask) return null;
  const askPrices = Object.keys(book.ask).map(Number);
  let evalask = book.bestask;
  let bestAskOffer;
  let AskIterator = book.ask[evalask].entries();
  if (book.ask[evalask]) {
    // Absolute best offer
    bestAskOffer = AskIterator.next().value;
  }
  // Iterate through the map(s) to find an unmatched offer
  while (findMatchee(book, bestAskOffer[0])) {
    bestAskOffer = AskIterator.next().value;

    // If none, we've exhausted a specific price level
    // Move to the next best available
    if (!bestAskOffer) {
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      evalask = Math.min(...askPrices.filter((p) => p > evalask));
      // If there are no more left, then can't match any asks
      if (evalask === Infinity) { return null; }

      AskIterator = book.ask[evalask].entries();
      bestAskOffer = AskIterator.next().value;
    }
  }
  return bestAskOffer;
}

// Find the best unmatched protected ask offer available
// If notMatcher is true, also make sure it is not matched to a pbid
function bestUnmatchedProtAsk(book: Book, notMatcher = false) {
  if (!book.bestpask) return null;
  const paskPrices = Object.keys(book.pask).map(Number);
  let evalpask = book.bestpask;
  // It's possible that the "best" protected price has already been matched
  // Best not to match it again (and send another ping to user)
  // Instead, match the next best unmatched protected offer
  let bestPAskOffer;
  let pAskIterator = book.pask[evalpask].entries();
  if (book.pask[evalpask]) {
    // Absolute best protected offer
    bestPAskOffer = pAskIterator.next().value;
  }

  // Iterate through the map(s) to find an unmatched offer
  while (book.protMatchMap[bestPAskOffer[0]]
      || (notMatcher && findMatchee(book, bestPAskOffer[0]))) {
    bestPAskOffer = pAskIterator.next().value;
    // If none, we've exhausted a specific price level
    // Move to the next best available
    if (!bestPAskOffer) {
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      evalpask = Math.min(...paskPrices.filter((p) => p > evalpask));
      // If there are no more left, then can't match this protected
      if (evalpask === Infinity) { return null; }

      pAskIterator = book.pask[evalpask].entries();
      bestPAskOffer = pAskIterator.next().value;
    }
  }
  return bestPAskOffer;
}

export default evaluateFn;
