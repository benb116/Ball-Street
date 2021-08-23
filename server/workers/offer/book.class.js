const { ProtectedMatch } = require('../../models');

/* eslint-disable class-methods-use-this */
class Book {
  constructor(contestID, nflPlayerID) {
    this.contestID = contestID;
    this.nflplayerID = nflPlayerID;

    this.queue = Promise.resolve();
    this.init = false; // has the book been initialized with offers and matches from the DB?

    // Tree objects, each key is a price level whose value is a Map
    // Maps preserve insertion order, so oldest offers at a price can be accessed first
    this.bid = {};
    this.pbid = {};
    this.ask = {};
    this.pask = {};

    // Evaluated best prices for each of the 4 offer types (number)
    this.bestbid = null;
    this.bestpbid = null;
    this.bestask = null;
    this.bestpask = null;

    // Map of protected matches (offer IDs)
    // key: matchee, value: matcher
    this.protMatchMap = {};
  }

  // Add a function to the book's serial queue
  enqueue(fn) {
    this.queue = this.queue.then(fn);
  }

  // Add an offer to the book
  add(offer) {
    const { isbid, price } = offer;
    // which tree to add to
    const thetree = this.whichTree(isbid, offer.protected);
    // If this is the first offer at a price, make a new limit
    if (!thetree[price]) {
      thetree[price] = new Map();
    }
    thetree[price].set(offer.id, {
      createdAt: Date.parse(offer.createdAt),
      UserId: offer.UserId,
      price,
    });
    return false;
  }

  // Remove and offer from the book
  cancel(offer) {
    const { isbid, price } = offer;
    const thetree = this.whichTree(isbid, offer.protected);

    if (!thetree[price]) return null;
    thetree[price].delete(offer.id);
    // If the limit price is now empty, delete it
    if (!thetree[price].size) {
      delete thetree[price];
    }
    return false;
  }

  // Mark that a protected offer has been matched
  // So it doesn't rematch over and over
  async match(matchee, matcher) {
    await ProtectedMatch.create({
      existingId: matchee.id,
      newId: matcher.id,
    });
    this.protMatchMap[matchee.id] = matcher.id;
  }

  // Mark that a protected offer is no longer matched
  // So it can be matched again
  async unmatch(matchee) {
    await ProtectedMatch.destroy({
      where: {
        existingId: matchee.id,
      },
    });
    delete this.protMatchMap[matchee.id];
  }

  // Find the match with the highest priority that can be made
  // Returns false for no matches
  // Returns with a bid and ask object detailing the offers
  evaluate() {
    // Get all prices that are being offered
    const bidPrices = Object.keys(this.bid).map(Number);
    const pbidPrices = Object.keys(this.pbid).map(Number);
    const askPrices = Object.keys(this.ask).map(Number);
    const paskPrices = Object.keys(this.pask).map(Number);

    // Get best prices and mark to the book for caching
    this.bestbid = Math.max(...bidPrices);
    this.bestpbid = Math.max(...pbidPrices);
    this.bestask = Math.min(...askPrices);
    this.bestpask = Math.min(...paskPrices);

    if (this.bestbid === -Infinity) { this.bestbid = null; }
    if (this.bestpbid === -Infinity) { this.bestpbid = null; }
    if (this.bestask === Infinity) { this.bestask = null; }
    if (this.bestpask === Infinity) { this.bestpask = null; }

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
    let evalbid = this.bestbid;
    let done = false; // flag, done looking at unprot bids, check prot bids next
    // Each map has an iterator that will spit out entries oldest first
    // Keep track of the iterator of the current best price for bids
    let bidIterator;
    if (!this.bestbid) { done = true; } else {
      bidIterator = this.bid[evalbid].entries();
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

        bidIterator = this.bid[evalbid].entries();
      } else {
        // We've found the best bid
        // First try to find a matching ask
        if (this.bestask && evalbid >= this.bestask) {
          bestaskOffer = this.ask[this.bestask].entries().next().value;
          return {
            bid: { id: bestbidOffer[0], data: bestbidOffer[1], protected: false },
            ask: { id: bestaskOffer[0], data: bestaskOffer[1], protected: false },
          };
        }

        // If that falls through, find an unmatched protected ask
        // but only if this bid has not matched a protask
        // since we don't want an offer to match multiple protoffers
        // Search through values (matchers) of the protMatchMap
        if (!this.findMatcher(bestbidOffer[0])) {
          // try to find a un/prot match and return
          bestpaskOffer = this.bestUnmatchedProtAsk();
          if (bestpaskOffer && evalbid >= bestpaskOffer[1].price) {
            return {
              bid: { id: bestbidOffer[0], data: bestbidOffer[1], protected: false },
              ask: { id: bestpaskOffer[0], data: bestpaskOffer[1], protected: true },
            };
          }
          // If we've gotten to this point with no matches,
          // we can't match this bid with anything
          // and all worse bids will also fail
          done = true;
        }

        // At this point, it's possible that the next best bid could match a protask
        // if it hasn't done so already. Cycle through and check again
      }
    }

    // Try to match the best pbid next
    let evalpbid = this.bestpbid;
    done = false; // done looking at prot bid
    let pbidIterator;
    if (!this.bestpbid) { done = true; } else {
      pbidIterator = this.pbid[evalpbid].entries();
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

        pbidIterator = this.pbid[evalpbid].entries();
      } else if (!this.protMatchMap[bestpbidOffer[0]]) {
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
        if (this.bestask && evalpbid >= this.bestask) {
          bestaskOffer = this.bestUnmatchedAsk();
          if (bestaskOffer) {
            return {
              bid: { id: bestpbidOffer[0], data: bestpbidOffer[1], protected: true },
              ask: { id: bestaskOffer[0], data: bestaskOffer[1], protected: false },
            };
          }
        }

        // If that falls through, find an unmatched protected ask
        // that has also not matched a different pbid
        // but only if this bid has not matched a pask before
        if (!this.findMatcher(bestpbidOffer[0])) {
          bestpaskOffer = this.bestUnmatchedProtAsk(true);
          if (bestpaskOffer && evalbid >= bestpaskOffer[1].price) {
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

  findMatcher(id) {
    return Object.keys(this.protMatchMap).find((key) => this.protMatchMap[key] === id);
  }

  // Find the best unmatched ask offer available
  bestUnmatchedAsk() {
    const askPrices = Object.keys(this.ask).map(Number);
    let evalask = this.bestask;
    let bestAskOffer;
    if (!evalask) return null;
    let AskIterator = this.ask[evalask].entries();
    if (this.ask[evalask]) {
      // Absolute best offer
      bestAskOffer = AskIterator.next().value;
    }
    // Iterate through the map(s) to find an unmatched offer
    while (this.findMatcher(bestAskOffer[0])) {
      bestAskOffer = AskIterator.next().value;

      // If none, we've exhausted a specific price level
      // Move to the next best available
      if (!bestAskOffer) {
        // eslint-disable-next-line no-loop-func
        evalask = Math.min(...askPrices.filter((p) => p > evalask));
        // If there are no more left, then can't match any asks
        if (evalask === Infinity) { evalask = null; return null; }

        AskIterator = this.ask[evalask].entries();
        bestAskOffer = AskIterator.next().value;
      }
    }
    return bestAskOffer;
  }

  // Find the best unmatched protected ask offer available
  // If notMatcher is true, also make sure it is not matched to a pbid
  bestUnmatchedProtAsk(notMatcher) {
    const paskPrices = Object.keys(this.pask).map(Number);
    let evalpask = this.bestpask;
    // It's possible that the "best" protected price has already been matched
    // Best not to match it again (and send another ping to user)
    // Instead, match the next best unmatched protected offer
    let bestPAskOffer;
    if (!evalpask) return null;
    let pAskIterator = this.pask[evalpask].entries();
    if (this.pask[evalpask]) {
      // Absolute best protected offer
      bestPAskOffer = pAskIterator.next().value;
    }
    // Iterate through the map(s) to find an unmatched offer

    while (this.protMatchMap[bestPAskOffer[0]]
        || (notMatcher && this.findMatcher(bestPAskOffer[0]))) {
      bestPAskOffer = pAskIterator.next().value;

      // If none, we've exhausted a specific price level
      // Move to the next best available
      if (!bestPAskOffer) {
        // eslint-disable-next-line no-loop-func
        evalpask = Math.min(...paskPrices.filter((p) => p > evalpask));
        // If there are no more left, then can't match this protected
        if (evalpask === Infinity) { evalpask = null; return null; }

        pAskIterator = this.pask[evalpask].entries();
        bestPAskOffer = pAskIterator.next().value;
      }
    }
    return bestPAskOffer;
  }

  // Find all offers in the book that could match a specific protected offer
  findProtectedMatches(offer) {
    const { isbid, price } = offer;
    // Search all unprotected opposite offers
    const thetree = this.whichTree(!isbid, false);
    // Get limits
    const allMatchingPrices = Object.keys(thetree)
      .map(Number)
      .filter((p) => (isbid && p <= price) || (!isbid && p >= price));
    // Get offers
    const allMatchingOffers = allMatchingPrices
      .map((p) => thetree[p]) // get limit trees
      .map((l) => [...l.keys()]) // get offers
      .reduce((acc, cur) => { // concat all
        const added = [...acc, ...cur];
        return added;
      }, []);

    // Search protected opposite offers that are newer than this offer
    const theptree = this.whichTree(!isbid, true);
    const allMatchingPPrices = Object.keys(theptree)
      .map(Number)
      .filter((p) => (isbid && p <= price) || (!isbid && p >= price));
    const allMatchingPOffers = allMatchingPPrices
      .map((p) => theptree[p])
      .map((l) => [...l.entries()])
      .reduce((acc, cur) => {
        const added = [...acc, ...cur];
        return added;
      }, [])
    // only offers submitted after protected
      .filter((e) => e[1].createdAt > Date.parse(offer.createdAt))
      .map((e) => e[0]);
    return [...allMatchingOffers, ...allMatchingPOffers];
  }

  // Which tree should an offer be added to
  whichTree(isbid, isprotected) {
    const combo = isbid + 2 * isprotected;
    let thetree = {};
    switch (combo) {
      case 0: // unprotected ask
        thetree = this.ask;
        break;
      case 1: // unprotected bid
        thetree = this.bid;
        break;
      case 2: // protected ask
        thetree = this.pask;
        break;
      case 3: // protected bid
        thetree = this.pbid;
        break;
      default:
        throw new Error('waaaat');
    }
    return thetree;
  }
}

module.exports = Book;
