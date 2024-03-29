// Run a high load test on the offer matching worker
// Create users, contests, and entries
// Submit random buy and sell orders from various users
// Some protected some not

import Contest from '../../features/contest/contest.model';
import Entry from '../../features/entry/entry.model';
import getNFLPlayerOfferSummary from '../../features/nflplayer/services/getNFLPlayerOfferSummary.service';
import Offer from '../../features/offer/offer.model';
import createOffer from '../../features/offer/services/createOffer.service';
import User from '../../features/user/user.model';
import logger from '../../utilities/logger';

const numUsers = 4000;

async function run() {
  // Set up
  await Contest.sync({ force: true });
  await User.sync({ force: true });
  await Entry.sync({ force: true });
  await Offer.sync({ force: true });
  // Create test contest
  const thecontest = await Contest.create({
    name: 'Load Test',
    nflweek: 18,
    budget: 10000,
    buyin: 0,
  });

  const userObjects = Array(numUsers);
  for (let i = 0; i < numUsers; i++) {
    userObjects[i] = {
      id: 10 + i,
      email: `testemail${i}@gmail.com`,
      pwHash: '1234567890',
      name: 'bot',
      cash: 100,
    } as User;
  }
  const userObjs = await User.bulkCreate(userObjects).catch();

  await Entry.bulkCreate(userObjs.map((e) => ({
    UserId: e.id,
    ContestId: thecontest.id,
    pointtotal: 10000,
    TE1: (e.id % 2 === 0 ? 33443 : 30157),
  }))).catch(logger.error);

  // Create offers
  for (let i = 0; i < numUsers; i++) {
    createOffer({
      user: i + 10,
      params: {
        contestID: thecontest.id,
      },
      body: {
        nflplayerID: 33443, // Player 1
        isbid: (i % 2 !== 0), // alternate bid/ask
        price: 1000 + Math.round(Math.random() * 10) * 100,
        protected: Math.random() < 0.5, // random is protected
      },
    }).catch(logger.error);
    createOffer({
      user: i + 10,
      params: {
        contestID: thecontest.id,
      },
      body: {
        nflplayerID: 30157,
        isbid: (i % 2 === 0),
        price: 1000 + Math.round(Math.random() * 10) * 100,
        protected: Math.random() < 0.5,
      },
    }).catch(logger.error);
  }

  // See results. Book should gradually decrease to steady state
  // highest bid < lowest ask
  setInterval(() => {
    getNFLPlayerOfferSummary({
      user: 10,
      params: {
        nflplayerID: 33443,
        contestID: thecontest.id,
      },
      body: {},
    }).then(JSON.stringify).then(logger.info);
  }, 200);
}

run();
