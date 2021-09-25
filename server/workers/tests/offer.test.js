/* eslint-disable no-console */
const WebSocket = require('ws');
const axios = require('axios');

const leagueID = 2;
const contestID = 2;

const createOffer = require('../../features/offer/services/createOffer.service');
const { rediskeys, set } = require('../../db/redis');
const config = require('../../config');

const tests = [
  'offer1',
  'nonMatch',
  'match',
  'fillNot',
  'matchUnprotected',
  'matchProtected',
  'fillProtected',
  'better',
  'matchbetter',
];

const pMap = tests.reduce((acc, cur) => {
  let pRes;
  let pRej;
  acc[cur] = {
    prom: new Promise((res, rej) => { pRes = res; pRej = rej; }),
  };
  acc[cur].res = pRes;
  acc[cur].rej = pRej;
  acc[cur].done = false;
  return acc;
}, {});

function reqBody(user = 1, nflplayerID = 21, isbid = false, price = 500, isProtected = false) {
  return {
    user,
    params: {
      leagueID,
      contestID,
    },
    body: {
      offerobj: {
        nflplayerID,
        isbid,
        price,
        protected: isProtected,
      },
    },
  };
}

function getSessionID(email) {
  return axios({
    method: 'post',
    url: 'http://localhost/app/auth/login',
    data: {
      email,
      password: 'password1',
    },
  }).then((resp) => resp.headers['set-cookie'][0].split(';')[0])
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      throw new Error('Could not init session');
    });
}

function initWS(cookie) {
  return new WebSocket(`ws://localhost/ballstreetlive/contest/${contestID}`, {
    headers: { cookie },
  });
}

async function run() {
  await set.hkey(rediskeys.bestbidHash(contestID), 21, 0);
  await set.hkey(rediskeys.bestaskHash(contestID), 21, 0);

  const session1 = await getSessionID('email1@gmail.com');
  const ws1 = initWS(session1);

  let cancelOffer = '';

  ws1.on('message', async (text) => {
    const msg = JSON.parse(text);
    switch (msg.event) {
      case 'offerFilled':
        if (!pMap.fillNot.done) {
          pMap.fillNot.done = true;
          pMap.fillNot.res(msg);
        } else if (!pMap.matchUnprotected.done) {
          pMap.matchUnprotected.done = true;
          if (msg.offerID === cancelOffer) {
            pMap.matchUnprotected.rej(msg);
          } else {
            pMap.matchUnprotected.res(msg);
            await createOffer(reqBody(1, 21, false, 300)).catch(console.log);
          }
        }
        break;
      case 'offerCancelled':
        break;
      case 'protectedMatch':
        break;
      case 'priceUpdate':
        if (Object.keys(msg.pricedata).length > 5) {
          return;
        }
        if (!pMap.offer1.done) {
          pMap.offer1.done = true;
          pMap.offer1.res(msg);
          const out = await createOffer(reqBody(2, 21, true, 400, true)).catch(console.log);
          cancelOffer = out.id;
        } else if (!pMap.nonMatch.done) {
          pMap.nonMatch.done = true;
          pMap.nonMatch.res(msg);
          await createOffer(reqBody(3, 21, true, 500)).catch(console.log);
        } else if (!pMap.match.done) {
          pMap.match.done = true;
          pMap.match.res(msg);
          await createOffer(reqBody(1, 21, true, 300)).catch(console.log);
          await createOffer(reqBody(3, 21, false, 300)).catch(console.log);
        }
        break;
      default:
        break;
    }
  });
  console.log('ready');
  await createOffer(reqBody()).catch(console.log);
}

async function run2() {
  const session2 = await getSessionID('email2@gmail.com');
  const ws2 = initWS(session2);

  ws2.on('message', async (text) => {
    const msg = JSON.parse(text);
    switch (msg.event) {
      case 'offerFilled':
        if (!pMap.fillProtected.done) {
          pMap.fillProtected.done = true;
          pMap.fillProtected.res(msg);
        }
        break;
      case 'protectedMatch':
        if (!pMap.matchProtected.done) {
          pMap.matchProtected.done = true;
          pMap.matchProtected.res(msg);
        }
        break;
      default:
        break;
    }
  });
}

beforeAll(() => { run(); run2(); });

describe('Offer matching tests', () => {
  test('Price update on offer', () => pMap.offer1.prom.then((data) => {
    expect(data.pricedata).toEqual(expect.objectContaining({
      21: { bestask: 500, bestbid: 0, nflplayerID: 21 },
    }));
  }), (config.RefreshTime + 1) * 1000);

  test('Price update on non-match', () => pMap.nonMatch.prom.then((data) => {
    expect(data.pricedata).toEqual(expect.objectContaining({
      21: { bestask: 500, bestbid: 400, nflplayerID: 21 },
    }));
  }), (config.RefreshTime + 1) * 1000);

  test('Price update on fill', () => pMap.match.prom.then((data) => {
    expect(data.pricedata).toEqual(expect.objectContaining({
      21: { bestask: 0, bestbid: 400, nflplayerID: 21 },
    }));
  }), (config.RefreshTime + 1) * 1000);

  test('Notify on fill', () => pMap.fillNot.prom.then((data) => {
    expect(data).toEqual(expect.objectContaining({ event: 'offerFilled' }));
    expect(data.offerID).toHaveLength(36);
  }));

  test('Fill better before protected', () => pMap.matchUnprotected.prom.then((data) => {
    expect(data).toEqual(expect.objectContaining({ event: 'offerFilled' }));
    expect(data.offerID).toHaveLength(36);
  }));

  test('Match notification', () => pMap.matchProtected.prom.then((data) => {
    expect(data).toEqual(expect.objectContaining({ event: 'protectedMatch' }));
    expect(data.offerID).toHaveLength(36);
    expect(data.expire).toBeGreaterThan(1629167862185);
  }), config.ProtectionDelay * 1000 + 5000);

  test('Fill protected', () => pMap.fillProtected.prom.then((data) => {
    expect(data).toEqual(expect.objectContaining({ event: 'offerFilled' }));
    expect(data.offerID).toHaveLength(36);
  }), config.ProtectionDelay * 1000 + 5000);
});

/*

Offer testing

Create offer:
  best price update
Create non-matching offer:
  price update

Create matching offer:
  Offer filled update
  price update

Create offer A protected
Create worse offer B unprotected
Create both-matching offer C
  Offer filled B and C

Create offer A protected
Create matching offers B then C
Cancel offer B
  unmatch

*/
