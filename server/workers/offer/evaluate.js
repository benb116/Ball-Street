/* eslint-disable no-param-reassign */
// Find the match with the highest priority that can be made
// Returns false for no matches

const logger = require('../../utilities/logger');

// Returns with a bid and ask object detailing the offers
function evaluateFn(book) {
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

  logger.verbose(`${book.contestID}-${book.nflplayerID} Evaluated prices: ${[book.bestbid, book.bestask, book.bestpbid, book.bestpask]
    .map((p) => p || 0).join(' ')}`);

  // Best offer of each type that is ready to match
  let bestbidOffer;
  let bestaskOffer;
  let bestpbidOffer;
  let bestpaskOffer;

  // Priority is given to unprotected offers
  // Try to match bid with ask
  // then bid with protask
  // then protbid with ask
  // and last protbid with protask

  // Try to match the best bid first
  let evalbid = book.bestbid;
  let done = false; // flag, done looking at unprot bids, check prot bids next
  // Each map has an iterator that will spit out entries oldest first
  // Keep track of the iterator of the current best price for bids
  let bidIterator;
  if (!book.bestbid) { done = true; } else {
    logger.verbose('Try to match the best bid');
    bidIterator = book.bid[evalbid].entries();
  }
  // Iterate through the map(s) to find the best offer
  while (!done) {
    bestbidOffer = bidIterator.next().value;
    // If none, we've exhausted a specific price level
    // Move to the next best price and try again
    if (!bestbidOffer) {
      // eslint-disable-next-line no-loop-func
      evalbid = Math.min(...bidPrices.filter((p) => p > evalbid));
      // If there are no more left, then exit this loop and go to pbids
      if (evalbid === Infinity) { evalbid = null; done = true; break; }
      logger.verbose(`next best bid price: ${evalbid}`);

      bidIterator = book.bid[evalbid].entries();
    } else {
      // We've found the best bid
      // First try to find a matching ask
      if (book.bestask && evalbid >= book.bestask) {
        logger.verbose('found bid + ask');
        bestaskOffer = book.ask[book.bestask].entries().next().value;
        return {
          bid: { id: bestbidOffer[0], data: bestbidOffer[1], protected: false },
          ask: { id: bestaskOffer[0], data: bestaskOffer[1], protected: false },
        };
      }

      // If that falls through, find an unmatched protected ask
      // but only if this bid has not matched a protask
      // since we don't want an offer to match multiple protoffers
      // Search through values (matchers) of the protMatchMap
      if (!findMatcher(book, bestbidOffer[0])) {
        // try to find a un/prot match and return
        bestpaskOffer = bestUnmatchedProtAsk(book);
        if (bestpaskOffer && evalbid >= bestpaskOffer[1].price) {
          logger.verbose('found bid + pask');
          return {
            bid: { id: bestbidOffer[0], data: bestbidOffer[1], protected: false },
            ask: { id: bestpaskOffer[0], data: bestpaskOffer[1], protected: true },
          };
        }
        // If we've gotten to this point with no matches,
        // we can't match this bid with anything
        // and all worse bids will also fail
        done = true;
        logger.verbose('exhausted bids');
      }

      // At this point, it's possible that the next best bid could match a protask
      // if it hasn't done so already. Cycle through and check again
    }
  }

  // Try to match the best pbid next
  let evalpbid = book.bestpbid;
  done = false; // done looking at prot bid
  let pbidIterator;
  if (!book.bestpbid) { done = true; } else {
    logger.verbose('Try to match the best pbid');
    pbidIterator = book.pbid[evalpbid].entries();
  }
  // Iterate through the map(s) to find the best offer
  while (!done) {
    bestpbidOffer = pbidIterator.next().value;
    // If none, we've exhausted a specific price level
    // Move to the next best price and try again
    if (!bestpbidOffer) {
      // eslint-disable-next-line no-loop-func
      evalpbid = Math.min(...pbidPrices.filter((p) => p > evalpbid));
      // If there are no more left, then exit
      if (evalpbid === Infinity) { evalpbid = null; done = true; break; }
      logger.verbose(`next best pbid price: ${evalpbid}`);

      pbidIterator = book.pbid[evalpbid].entries();
    } else if (!book.protMatchMap[bestpbidOffer[0]]) {
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
      // 1 pbid offered
      // 2 ask offered that matches 1
      // 3 this pbid offered that would match 2 but doesn't cause it matched 1 already
      // 4 ask that matches 3
      // 1 is cancelled, leaving 2 alone
      // ^ this scenario is fine, because 2 will be included in the random drawing for 3

      // If this pbid hasn't been matched yet, try ask, then pask

      // First try to find a matching ask that hasn't matched another pbid
      bestaskOffer = bestUnmatchedAsk(book);
      if (bestaskOffer) {
        if (bestaskOffer[1] && evalpbid >= bestaskOffer[1].price) {
          logger.verbose('found pbid + ask');
          return {
            bid: { id: bestpbidOffer[0], data: bestpbidOffer[1], protected: true },
            ask: { id: bestaskOffer[0], data: bestaskOffer[1], protected: false },
          };
        }
      }

      // If that falls through, find an unmatched protected ask
      // that has also not matched a different pbid
      // but only if this bid has not matched a pask before
      if (!findMatcher(book, bestpbidOffer[0])) {
        bestpaskOffer = bestUnmatchedProtAsk(book, true);
        if (bestpaskOffer && evalpbid >= bestpaskOffer[1].price) {
          logger.verbose('found pbid + pask');
          return {
            bid: { id: bestpbidOffer[0], data: bestpbidOffer[1], protected: true },
            ask: { id: bestpaskOffer[0], data: bestpaskOffer[1], protected: true },
          };
        }
        // If we've gotten to this point with no matches,
        // we can't match this bid with anything
        // and all worse bids will also fail
        done = true;
      }
    }
  }
  // if nothing, return false;
  return false;
}

function findMatcher(book, id) {
  return Object.keys(book.protMatchMap).find((key) => book.protMatchMap[key] === id);
}

// Find the best unmatched ask offer available
function bestUnmatchedAsk(book) {
  const askPrices = Object.keys(book.ask).map(Number);
  let evalask = book.bestask;
  let bestAskOffer;
  if (!evalask) return null;
  let AskIterator = book.ask[evalask].entries();
  if (book.ask[evalask]) {
    // Absolute best offer
    bestAskOffer = AskIterator.next().value;
  }
  // Iterate through the map(s) to find an unmatched offer
  while (findMatcher(book, bestAskOffer[0])) {
    bestAskOffer = AskIterator.next().value;

    // If none, we've exhausted a specific price level
    // Move to the next best available
    if (!bestAskOffer) {
      // eslint-disable-next-line no-loop-func
      evalask = Math.min(...askPrices.filter((p) => p > evalask));
      // If there are no more left, then can't match any asks
      if (evalask === Infinity) { evalask = null; return null; }

      AskIterator = book.ask[evalask].entries();
      bestAskOffer = AskIterator.next().value;
    }
  }
  return bestAskOffer;
}

// Find the best unmatched protected ask offer available
// If notMatcher is true, also make sure it is not matched to a pbid
function bestUnmatchedProtAsk(book, notMatcher) {
  const paskPrices = Object.keys(book.pask).map(Number);
  let evalpask = book.bestpask;
  // It's possible that the "best" protected price has already been matched
  // Best not to match it again (and send another ping to user)
  // Instead, match the next best unmatched protected offer
  let bestPAskOffer;
  if (!evalpask) return null;
  let pAskIterator = book.pask[evalpask].entries();
  if (book.pask[evalpask]) {
    // Absolute best protected offer
    bestPAskOffer = pAskIterator.next().value;
  }
  // Iterate through the map(s) to find an unmatched offer

  while (book.protMatchMap[bestPAskOffer[0]]
      || (notMatcher && findMatcher(book, bestPAskOffer[0]))) {
    bestPAskOffer = pAskIterator.next().value;

    // If none, we've exhausted a specific price level
    // Move to the next best available
    if (!bestPAskOffer) {
      // eslint-disable-next-line no-loop-func
      evalpask = Math.min(...paskPrices.filter((p) => p > evalpask));
      // If there are no more left, then can't match this protected
      if (evalpask === Infinity) { evalpask = null; return null; }

      pAskIterator = book.pask[evalpask].entries();
      bestPAskOffer = pAskIterator.next().value;
    }
  }
  return bestPAskOffer;
}

module.exports = evaluateFn;
