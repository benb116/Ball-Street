import Offer from '../../features/offer/offer.model';
import ProtectedMatch from '../../features/protectedmatch/protectedmatch.model';
import logger from '../../utilities/logger';

import evaluateFn from './evaluate.offer';

export type LimitMap = Map<string, Offer>;
type LimitTree = Record<string, LimitMap>;

interface MatcherType {
  id: string
}
// Inspired by https://web.archive.org/web/20110219163448/http://howtohft.wordpress.com/2011/02/15/how-to-build-a-fast-limit-order-book/
/**
 * A book is created for every NFLPlayer in each contest.
 * It keeps an in-memory store of all offers to consider.
 */
class Book {
  contestID: number;
  nflplayerID: number;
  queue: Promise<unknown>;
  init: boolean;
  bid: LimitTree;
  pbid: LimitTree;
  ask: LimitTree;
  pask: LimitTree;
  bestbid: number | null;
  bestpbid: number | null;
  bestask: number | null;
  bestpask: number | null;
  protMatchMap: Record<string, string>;
  constructor(contestID: number, nflPlayerID: number) {
    this.contestID = contestID;
    this.nflplayerID = nflPlayerID;

    /**
      Each book has a queue of promises that can be chained to.
      This means that functions can be guaranteed to run sequentially.
      Any operation on a book should be done by "enqueueing" it as a function like so:
      playerBook.enqueue(async () => { await doSomething(input); });
      That way there will be no race conditions within a single contest+player
      Other race conditions could still occur at the DB,
      but those should be handled by transactions.
    */
    this.queue = Promise.resolve();
    this.init = false; // has the book been initialized with offers and matches from the DB?

    /*
      Tree objects, each key is a price level whose value is a Map
      {
        price: Map({
          offerID: {
            createdAt: date
            UserId,
            price
          }
        })
      }
      Offers are added and removed from the maps
      Maps preserve insertion order with new orders inserted at the end
      Because priority at a price level favors older offers,
      The oldest offer is easily pulled from the front of the map
      In that way, the maps act like linked lists
    */
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

  /** Add a function to the book's serial queue */
  enqueue(fn: ((inp: unknown) => unknown)) {
    this.queue = this.queue.then(fn).catch((err) => {
      logger.error(`Book error: Contest:${this.contestID} Player:${this.nflplayerID}`, err);
    });
  }

  begin() {
    this.enqueue(async () => { await this.beginBook(); });
  }

  /** It's possible that the book will been called again before the first init is complete.
   * In that case, we don't want to mark the book as init=true until it's ready,
   * but we also don't want to have the second call reinit the book.
   * So add the init process as an item on the book queue.
   * The first will complete, and when the second is attempted, init will be true so exit.
   */
  private async beginBook() {
    if (this.init) return Promise.resolve();
    return this.initializeBook()
      // eslint-disable-next-line no-param-reassign
      .then(() => { this.init = true; })
      .catch((err) => {
        // eslint-disable-next-line no-param-reassign
        this.init = false;
        throw Error(err);
      });
  }

  /** Generate the starting book based on existing offers in DB */
  private async initializeBook() {
    const { contestID, nflplayerID } = this;
    // Should be sorted oldest first since Maps maintain order
    const sortedOffers = await Offer.findAll({
      where: {
        ContestId: contestID,
        NFLPlayerId: nflplayerID,
        filled: false,
        cancelled: false,
      },
      order: [
        ['createdAt', 'ASC'],
      ],
    });
    sortedOffers.forEach((o) => this.add(o.toJSON()));
    // Also add protected matches that have been previously created
    const protMatches = await ProtectedMatch.findAll({
      include: {
        model: Offer,
        as: 'existing',
        where: {
          ContestId: contestID,
          NFLPlayerId: nflplayerID,
        },
      },
      where: { active: true },
    });
    protMatches.forEach((m) => {
      // eslint-disable-next-line no-param-reassign
      this.protMatchMap[m.existingId] = m.newId;
    });
    logger.info(`Book initialized: Contest ${contestID} Player ${nflplayerID}`);
    return true;
  }

  /** Add an offer to the book */
  async add(offer: Offer) {
    const { isbid, price } = offer;
    // which tree to add to
    const thetree = this.whichTree(isbid, offer.protected);
    // If this is the first offer at a price, make a new limit
    if (!thetree[price]) thetree[price] = new Map();
    const priceLimit = thetree[price];
    if (!priceLimit) return;
    priceLimit.set(offer.id, offer);
  }

  /** Remove and offer from the book */
  async cancel(offer: Offer) {
    const { isbid, price } = offer;
    const thetree = this.whichTree(isbid, offer.protected);

    const priceLimit = thetree[price];
    if (!priceLimit) return;
    priceLimit.delete(offer.id);
    // If the limit price is now empty, delete it
    if (!priceLimit.size) {
      delete thetree[price];
    }

    // if offer was part of a protected match, delete it
    this.unmatch(offer).catch(() => {});
  }

  /**
   * Mark that a protected offer has been matched
   * so it doesn't rematch over and over
   */
  async match(matchee: MatcherType, matcher: MatcherType) {
    await ProtectedMatch.create({
      existingId: matchee.id,
      newId: matcher.id,
    });
    logger.info(`Protected match: ${matchee.id} ${matcher.id}`);
    this.protMatchMap[matchee.id] = matcher.id;
  }

  /**
   * Mark that a protected offer is no longer matched
   * so it can be matched again
   */
  async unmatch(matchee: MatcherType) {
    delete this.protMatchMap[matchee.id];
    await ProtectedMatch.update({ active: false }, {
      where: { existingId: matchee.id },
    });
  }

  evaluate() {
    return evaluateFn(this);
  }

  /** Which tree should an offer be added to */
  whichTree(isbid: boolean, isprotected: boolean): LimitTree {
    const combo = Number(isbid) + 2 * Number(isprotected);
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

  /** Find all offers in the book that could match a specific protected offer */
  findProtectedMatches(offer: Offer) {
    const { isbid, price } = offer;
    // Search all unprotected opposite offers
    const thetree = this.whichTree(!isbid, false);
    // Get offers
    const allMatchingOffers = Object.entries(thetree)
      .filter((p) => (isbid && Number(p[0]) <= price) || (!isbid && Number(p[0]) >= price))
      .map((l) => [...l[1].entries()]) // get offers
      .reduce((acc, cur) => [...acc, ...cur], []) // concat all
      .map((e) => e[1]);

    // Search protected opposite offers that have not been matched
    const theptree = this.whichTree(!isbid, true);
    const allMatchingPOffers = Object.entries(theptree)
      .filter((p) => (isbid && Number(p[0]) <= price) || (!isbid && Number(p[0]) >= price))
      .map((l) => [...l[1].entries()])
      .reduce((acc, cur) => [...acc, ...cur], []) // concat all
    // only offers that have not been matched
      .filter((e) => !this.protMatchMap[e[0]])
      .map((e) => e[1]);
    return [...allMatchingOffers, ...allMatchingPOffers];
  }
}

export default Book;
