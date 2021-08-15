/* eslint-disable class-methods-use-this */
class Book {
  constructor(contestID, nflPlayerID) {
    this.contestID = contestID;
    this.nflplayerID = nflPlayerID;

    this.queue = Promise.resolve();
    this.init = false;

    this.bid = {};
    this.pbid = {};
    this.ask = {};
    this.pask = {};

    this.bestbid = null;
    this.bestpbid = null;
    this.bestask = null;
    this.bestpask = null;
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
    // If the limit is now empty, delete it
    if (!thetree[price].size) {
      delete thetree[price];
    }
    return false;
  }

  // Mark that a protected offer has been matched
  // So it doesn't rematch over and over
  match(offer, isbid) {
    const { data } = offer;
    const { price } = data;
    const thetree = this.whichTree(isbid, true);
    if (!thetree[price]) {
      return;
    }
    thetree[price].set(offer.id, {
      createdAt: offer.data.createdAt,
      UserId: offer.data.UserId,
      matched: true,
      price,
    });
  }

  // Mark that a protected offer is no longer matched
  // So it can be matched again
  unmatch(offer, isbid) {
    const { price } = offer;
    const thetree = this.whichTree(isbid, true);
    if (!thetree[price]) {
      return;
    }
    thetree[price].set(offer.id, {
      createdAt: offer.createdAt,
      UserId: offer.UserId,
      matched: false,
      price,
    });
  }

  // Get best prices and determine if there's a match
  evaluate() {
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

    // Best prices for use in evaluation
    // May differ if best price is a matched protected offer
    // In that case, may need to consider worse prices
    const evalbid = this.bestbid;
    let evalpbid = this.bestpbid;
    const evalask = this.bestask;
    let evalpask = this.bestpask;

    // Four possible match combos bid/ask, protected/unprotected
    // Give preference to filling unprotected offers
    // by checking them first in the evaluate algorithm

    // is the bid >= the ask?
    if (evalbid && evalask && evalbid >= evalask) {
      const bidOffer = this.bid[evalbid].entries().next().value;
      const askOffer = this.ask[evalask].entries().next().value;
      return {
        bid: { id: bidOffer[0], data: bidOffer[1], protected: false },
        ask: { id: askOffer[0], data: askOffer[1], protected: false },
      };
    }

    // It's possible that the "best" protected price has already been matched
    // Best not to match it again (and send another ping to user)
    // Instead, match the next best unmatched protected offer
    let bestPAskOffer;
    if (evalpask) {
      let pAskIterator = this.pask[evalpask].entries();
      if (this.pask[evalpask]) {
        // Absolute best protected offer
        bestPAskOffer = pAskIterator.next().value;
      }
      // Iterate through the map(s) to find an unmatched offer
      while (bestPAskOffer[1]?.matched) {
        bestPAskOffer = pAskIterator.next().value;

        // If none, we've exhausted a specific price level
        // Move to the next best available
        if (!bestPAskOffer) {
        // eslint-disable-next-line no-loop-func
          evalpask = Math.min(...paskPrices.filter((p) => p > evalpask));
          // If there are no more left, then can't match this protected
          if (evalpask === Infinity) { evalpask = null; break; }

          pAskIterator = this.pask[evalpask].entries();
          bestPAskOffer = pAskIterator.next().value;
        }
      }
    }

    if (evalbid && evalpask && evalbid >= evalpask) {
      const bidOffer = this.bid[evalbid].entries().next().value;
      const askOffer = bestPAskOffer;
      return {
        bid: { id: bidOffer[0], data: bidOffer[1], protected: false },
        ask: { id: askOffer[0], data: askOffer[1], protected: true },
      };
    }

    // Same for bids as for asks
    let bestPBidOffer;
    if (evalpbid) {
      let pBidIterator = this.pbid[evalpbid].entries();
      if (this.pbid[evalpbid]) {
        bestPBidOffer = pBidIterator.next().value;
      }
      while (bestPBidOffer[1]?.matched) {
        bestPBidOffer = pBidIterator.next().value;
        if (!bestPBidOffer) {
        // eslint-disable-next-line no-loop-func
          evalpbid = Math.max(...pbidPrices.filter((p) => p < evalpbid));
          if (evalpbid === -Infinity) { evalpbid = null; break; }

          pBidIterator = this.pbid[evalpbid].entries();
          bestPBidOffer = pBidIterator.next().value;
        }
      }
    }

    if (evalpbid && evalask && evalpbid >= evalask) {
      const bidOffer = bestPBidOffer;
      const askOffer = this.ask[evalask].entries().next().value;
      return {
        bid: { id: bidOffer[0], data: bidOffer[1], protected: true },
        ask: { id: askOffer[0], data: askOffer[1], protected: false },
      };
    }
    if (evalpbid && evalpask && evalpbid >= evalpask) {
      const bidOffer = bestPBidOffer;
      const askOffer = bestPAskOffer;
      return {
        bid: { id: bidOffer[0], data: bidOffer[1], protected: true },
        ask: { id: askOffer[0], data: askOffer[1], protected: true },
      };
    }

    // If none, return false
    return false;
  }

  // Find offers in the book that could match a specific protected offer
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
