// Offer server worker
// Processes jobs on the offer queue
// Tries to reduce order book whenever an offer comes in
// Sends out matches to be filled
import Queue from 'bull';

import { ProtectionDelay } from '../config';

import logger from '../utilities/logger';

import { queueOptions } from '../db/redis';

import protectedMatch from './live/channels/protectedMatch.channel';

import fillOffers from './offer/trader.offer';
import { getBook, updateBest } from './offer/util.offer';
import evalProtected from './offer/protected.offer';
import Book from './offer/book.offer';

import { OfferType } from '../features/offer/offer.model';
import { MatchPair } from './offer/evaluate.offer';

const offerQueue = new Queue('offer-queue', queueOptions);
const protectedQueue = new Queue('protected-queue', queueOptions);

// books[contestID][playerID] = Book
const books = { };

const parallelProcessors = 10;

// When a new offer comes in
offerQueue.process(parallelProcessors, processor);

// When a protected match comes back around
protectedQueue.process(parallelProcessors, protectedProcessor);

interface OfferJob {
  data: OfferType
}

interface ProtMatchType {
  existingOffer: string,
  newOffer: string,
  ContestId: number,
  NFLPlayerId: number,
}
interface ProtMatchJob {
  data: ProtMatchType,
}

function processor(job: OfferJob) {
  const { ContestId, NFLPlayerId } = job.data;
  logger.info(JSON.stringify(job.data));
  // Get the appropriate book (or make one)
  const playerBook = getBook(books, ContestId, NFLPlayerId);
  // Add the action to the queue
  if (job.data.cancelled) {
    playerBook.enqueue(() => { playerBook.cancel(job.data); });
  } else {
    playerBook.enqueue(() => { playerBook.add(job.data); });
  }
  // Add an evaluation to the queue
  playerBook.enqueue(async () => { await evaluateBook(playerBook); });
}

function protectedProcessor(job: ProtMatchJob) {
  logger.info(JSON.stringify(job.data));
  const { ContestId, NFLPlayerId } = job.data;
  const playerBook = getBook(books, ContestId, NFLPlayerId);
  playerBook.enqueue(async () => { await evalProtected(playerBook, job.data.existingOffer, job.data.newOffer); });
}

// Check the book and iteratively try to execute matches
// Operations in this function are not added to the book queue
// because this function is being run in the queue already.
// Operations should be done serially
// so async operations are awaited within this loop
async function evaluateBook(playerBook: Book) {
  let match = playerBook.evaluate();
  let oldMatch: false | MatchPair = false;
  while (match) {
    try {
      // If we get the same match twice in a row, something is wrong
      if (oldMatch && match.bid.id === oldMatch.bid.id && match.ask.id === oldMatch.ask.id) {
        throw new Error(`Consecutive matches are identical ${JSON.stringify(match)}`);
      }
      oldMatch = { ...match };
      logger.info(`match ${match.bid.id} ${match.ask.id}`);
      const isBidOld = (Date.parse(match.bid.createdAt) < Date.parse(match.ask.createdAt));
      const oldOffer = (isBidOld ? match.bid : match.ask);
      const newOffer = (!isBidOld ? match.bid : match.ask);

      // If the old offer is protected, create a protMatch
      if (oldOffer.protected) {
        // eslint-disable-next-line no-await-in-loop
        await playerBook.match(oldOffer, newOffer);
        addToProtectedMatchQueue(oldOffer, newOffer, playerBook.contestID, playerBook.nflplayerID);
      } else {
        // Otherwise try to fill the offer now
        // eslint-disable-next-line no-await-in-loop
        const result = await fillOffers(match.bid.id, match.ask.id);
        // Remove filled or errored orders from the book
        if (!result.bid || result.bid.filled || result.bid.cancelled) {
          playerBook.cancel(result.bid || match.bid);
        }
        if (!result.ask || result.ask.filled || result.ask.cancelled) {
          playerBook.cancel(result.ask || match.ask);
        }
      }

      // Check if there's another match
      match = playerBook.evaluate();
    } catch (error) {
      logger.error(`${playerBook.contestID}-${playerBook.nflplayerID} - ${error}`);
      match = false;
    }
  }
  // Set latest best prices
  updateBest(playerBook);
}

// Add a protMatch to the queue and send a ping
function addToProtectedMatchQueue(eOffer: OfferType, nOffer: OfferType, ContestId: number, NFLPlayerId: number) {
  protectedQueue.add({
    existingOffer: eOffer.id,
    newOffer: nOffer.id,
    ContestId,
    NFLPlayerId,
  } as ProtMatchType, { delay: ProtectionDelay * 1000 });
  // Send ping to user
  protectedMatch.pub({
    userID: eOffer.UserId,
    offerID: eOffer.id,
    expire: Date.now() + ProtectionDelay * 1000,
  });
}
