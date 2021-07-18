/* eslint-disable class-methods-use-this */
class Book {
  constructor() {
    this.contestID = null;
    this.nflPlayerID = null;

    this.bid = {};
    this.pbid = {};
    this.ask = {};
    this.pask = {};

    this.bestbid = null;
    this.bestpbid = null;
    this.bestask = null;
    this.bestpask = null;
  }

  add(offer) {
    const { isbid, price } = offer;
    const thetree = this.whichTree(isbid, offer.protected);
    if (!thetree[price]) {
      thetree[price] = new Map();
    }
    thetree[price].set(offer.id, { createdAt: offer.createdAt, UserId: offer.UserId });
    return false;
  }

  cancel(offer) {
    const { isbid, price } = offer;
    const thetree = this.whichTree(isbid, offer.protected);

    if (!thetree[price]) return null;
    thetree[price].delete(offer.id);
    if (!thetree[price].size) {
      delete thetree[price];
      return this.evaluate();
    }
    return false;
  }

  evaluate() {
    this.bestbid = Math.max(...Object.keys(this.bid).map(Number));
    this.bestpbid = Math.max(...Object.keys(this.pbid).map(Number));
    this.bestask = Math.min(...Object.keys(this.ask).map(Number));
    this.bestpask = Math.min(...Object.keys(this.pask).map(Number));

    if (this.bestbid === -Infinity) { this.bestbid = null; }
    if (this.bestpbid === -Infinity) { this.bestpbid = null; }
    if (this.bestask === Infinity) { this.bestask = null; }
    if (this.bestpask === Infinity) { this.bestpask = null; }

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

  findProtectedMatches(offer) {
    const { isbid, price } = offer;
    const thetree = this.whichTree(!isbid, false);
    const allMatchingPrices = Object.keys(thetree)
      .map(Number)
      .filter((p) => (isbid && p <= price) || (!isbid && p >= price));
    const allMatchingOffers = allMatchingPrices
      .map((p) => thetree[p])
      .map((l) => [...l.keys()])
      .reduce((acc, cur) => {
        const added = [...acc, ...cur];
        return added;
      }, []);

    return allMatchingOffers;
  }

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
