/* eslint-disable class-methods-use-this */
class Book {
  constructor(contestID, nflPlayerID) {
    this.contestID = contestID;
    this.nflPlayerID = nflPlayerID;

    this.bid = {};
    this.pbid = {};
    this.ask = {};
    this.pask = {};

    this.bestbid = null;
    this.bestpbid = null;
    this.bestask = null;
    this.bestpask = null;
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
    thetree[price].set(offer.id, { createdAt: Date.parse(offer.createdAt), UserId: offer.UserId });
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

  // Get best prices and determine if there's a match
  evaluate() {
    // Get best prices
    this.bestbid = Math.max(...Object.keys(this.bid).map(Number));
    this.bestpbid = Math.max(...Object.keys(this.pbid).map(Number));
    this.bestask = Math.min(...Object.keys(this.ask).map(Number));
    this.bestpask = Math.min(...Object.keys(this.pask).map(Number));

    if (this.bestbid === -Infinity) { this.bestbid = null; }
    if (this.bestpbid === -Infinity) { this.bestpbid = null; }
    if (this.bestask === Infinity) { this.bestask = null; }
    if (this.bestpask === Infinity) { this.bestpask = null; }

    // Four possible match combos bid/ask, protected/unprotected
    // is the bid >= the ask?
    if (this.bestbid && this.bestask && this.bestbid >= this.bestask) {
      const bidOffer = this.bid[this.bestbid].entries().next().value;
      const askOffer = this.ask[this.bestask].entries().next().value;
      return {
        bid: { id: bidOffer[0], data: bidOffer[1], protected: false },
        ask: { id: askOffer[0], data: askOffer[1], protected: false },
      };
    }
    if (this.bestbid && this.bestpask && this.bestbid >= this.bestpask) {
      const bidOffer = this.bid[this.bestbid].entries().next().value;
      const askOffer = this.pask[this.bestpask].entries().next().value;
      return {
        bid: { id: bidOffer[0], data: bidOffer[1], protected: false },
        ask: { id: askOffer[0], data: askOffer[1], protected: true },
      };
    }
    if (this.bestpbid && this.bestask && this.bestpbid >= this.bestask) {
      const bidOffer = this.pbid[this.bestpbid].entries().next().value;
      const askOffer = this.ask[this.bestask].entries().next().value;
      return {
        bid: { id: bidOffer[0], data: bidOffer[1], protected: true },
        ask: { id: askOffer[0], data: askOffer[1], protected: false },
      };
    }
    if (this.bestpbid && this.bestpask && this.bestpbid >= this.bestpask) {
      const bidOffer = this.pbid[this.bestpbid].entries().next().value;
      const askOffer = this.pask[this.bestpask].entries().next().value;
      return {
        bid: { id: bidOffer[0], data: bidOffer[1], protected: true },
        ask: { id: askOffer[0], data: askOffer[1], protected: true },
      };
    }

    return false;
  }

  // Find offers in the book that could match a specific protected offer
  findProtectedMatches(offer) {
    const { isbid, price } = offer;
    // Search all unprotected offers
    const thetree = this.whichTree(!isbid, false);
    // Get limits
    const allMatchingPrices = Object.keys(thetree)
      .map(Number)
      .filter((p) => (isbid && p <= price) || (!isbid && p >= price));
    // Get offers
    const allMatchingOffers = allMatchingPrices
      .map((p) => thetree[p])
      .map((l) => [...l.keys()])
      .reduce((acc, cur) => {
        const added = [...acc, ...cur];
        return added;
      }, []);

    // Search protected offers that are newer than this offer
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
