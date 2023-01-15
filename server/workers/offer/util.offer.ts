import bestask from '../../db/redis/bestask.redis';
import bestbid from '../../db/redis/bestbid.redis';
import priceUpdate from '../live/channels/priceUpdate.channel';

import Book from './book.offer';

/** Access the correct book or make one if necessary */
export function getBook(
  books: Record<string, Record<string, Book>>,
  ContestId: number,
  NFLPlayerId: number,
) {
  // eslint-disable-next-line no-param-reassign
  books[ContestId] = books[ContestId] || {};
  const contestbooks = books[ContestId] || {};
  const playerBook = contestbooks[NFLPlayerId] || new Book(ContestId, NFLPlayerId);
  contestbooks[NFLPlayerId] = playerBook;
  // There may be existing offers and matches in the DB, so add them to the book
  // If the book hasn't been inited, try to init
  if (!playerBook.init) { playerBook.begin(); }
  return playerBook;
}

/** Send out latest price info based on book */
export function updateBest(playerBook: Book) {
  const { contestID, nflplayerID } = playerBook;

  const bestbids = [playerBook.bestbid, playerBook.bestpbid].filter((e) => e !== null).map(Number);
  const bestasks = [playerBook.bestask, playerBook.bestpask].filter((e) => e !== null).map(Number);

  let playerbestbid = 0;
  let playerbestask = 0;
  if (bestbids.length === 2) playerbestbid = Math.max(...bestbids);
  if (bestbids.length === 1) playerbestbid = bestbids[0] || 0;
  if (bestasks.length === 2) playerbestask = Math.min(...bestasks);
  if (bestasks.length === 1) playerbestask = bestasks[0] || 0;

  bestbid.set(contestID, nflplayerID, playerbestbid);
  bestask.set(contestID, nflplayerID, playerbestask);

  priceUpdate.pub('best', contestID, nflplayerID, playerbestbid, playerbestask);
}
