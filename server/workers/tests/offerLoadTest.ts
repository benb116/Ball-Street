import User from '../../features/user/user.model';
import Contest from '../../features/contest/contest.model';
import Entry from '../../features/entry/entry.model';

import createOffer from '../../features/offer/services/createOffer.service';
import Offer from '../../features/offer/offer.model';
import logger from '../../utilities/logger';

const numUsers = 50;

async function run() {
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
    TE1: (e.id % 2 === 0 ? 29315 : 30142),
  }))).catch(logger.error);

  for (let i = 0; i < numUsers; i++) {
    createOffer({
      user: i + 10,
      params: {
        contestID: thecontest.id,
      },
      body: {
        offerobj: {
          nflplayerID: 29315,
          isbid: (i % 2 !== 0),
          price: 1000 + Math.round(Math.random() * 10) * 100,
          protected: Math.random() < 0.3,
        },
      },
    }).catch(logger.error);
    createOffer({
      user: i + 10,
      params: {
        contestID: thecontest.id,
      },
      body: {
        offerobj: {
          nflplayerID: 30142,
          isbid: (i % 2 === 0),
          price: 1000 + Math.round(Math.random() * 10) * 100,
          protected: Math.random() < 0.3,
        },
      },
    }).catch(logger.error);
  }
}

run();

// Create offers
