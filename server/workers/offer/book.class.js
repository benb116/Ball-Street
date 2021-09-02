const { ProtectedMatch } = require('../../models');
const logger = require('../../utilities/logger');
const evaluateFn = require('./evaluate');

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
    this.queue = this.queue.then(fn).catch((err) => {
      // eslint-disable-next-line no-console
      console.log(`Book error: Contest:${this.contestID} Player:${this.nflplayerID}`, err);
    });
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
    logger.info(`Protected match: ${matchee.id} ${matcher.id}`);
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

  evaluate() {
    return evaluateFn(this);
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
}

module.exports = Book;
