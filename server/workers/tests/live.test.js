/* eslint-disable no-console */
const WebSocket = require('ws');
const axios = require('axios');
const config = require('../../config');

const leagueID = 2;
const contestID = 2;

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
      console.log(err);
      throw new Error('Could not init session');
    });
}

function initWS(cookie) {
  return new WebSocket(`ws://localhost/ballstreetlive/contest/${contestID}`, {
    headers: { cookie },
  });
}

function createOffer(cookie, isbid, price, isprotected) {
  return axios({
    method: 'post',
    url: `http://localhost/app/api/leagues/${leagueID}/contests/${contestID}/offer/`,
    data: {
      offerobj: {
        nflplayerID: 18047,
        isbid,
        price,
        protected: isprotected,
      },
    },
    headers: { cookie },
  }).catch((err) => {
    console.log(err);
    throw new Error('Could not create offer');
  });
}

async function cancelOffer(cookie) {
  const a = await axios({
    method: 'get',
    url: `http://localhost/app/api/leagues/${leagueID}/contests/${contestID}/offers/`,
    headers: { cookie },
  }).then((offers) => offers.data.filter((o) => o.NFLPlayerId === 18047));
  if (!a.length) { return Promise.resolve(); }

  return axios({
    method: 'delete',
    url: `http://localhost/app/api/leagues/${leagueID}/contests/${contestID}/offer/`,
    data: { offerID: a[0].id },
    headers: { cookie },
  }).catch((err) => {
    console.log(err);
    throw new Error('Could not create offer');
  });
}

const tests = ['open1', 'leader', 'initPrice', 'offerPrice', 'cancelPrice', 'protMatch', 'fillOffer'];
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

async function initUsers() {
  const session1 = await getSessionID('email1@gmail.com');
  const session2 = await getSessionID('email2@gmail.com');
  const ws1 = initWS(session1);
  // const ws2 = initWS(session2);
  ws1.on('open', () => {
    pMap.open1.res();
  });
  ws1.on('error', console.log);

  ws1.on('message', async (text) => {
    const msg = JSON.parse(text);
    switch (msg.event) {
      case 'offerFilled':
        pMap.fillOffer.res(msg);
        break;
      case 'offerCancelled':
        break;
      case 'protectedMatch':
        pMap.protMatch.res(msg);
        break;
      case 'leaderboard':
        pMap.leader.res();
        break;
      case 'phaseChange':
        break;
      case 'priceUpdate':
        if (msg.pricedata.length > 10) {
          pMap.initPrice.res(msg);
        } else if (!pMap.offerPrice.done) {
          pMap.offerPrice.done = true;
          pMap.offerPrice.res(msg);
          cancelOffer(session1);
        } else if (!pMap.cancelPrice.done) {
          pMap.cancelPrice.done = true;
          pMap.cancelPrice.res(msg);
          await createOffer(session1, true, 100, true);
          await (createOffer(session2, false, 100, false));
        }
        break;
      case 'statUpdate':
        break;
      default:
        break;
    }
  });
  await cancelOffer(session1);
  await createOffer(session1, true, 100, false);

  console.log('ready');
}

beforeAll(() => initUsers());

describe('Live server tests', () => {
  test('Open WS connection', () => pMap.open1.prom.then((data) => {
    expect(data).toBe();
  }));

  test('Get leaderboard', () => pMap.leader.prom.then((data) => {
    expect(data).toBe();
  }), 12000);

  test('Get initial price', () => pMap.initPrice.prom.then((data) => {
    expect(data.pricedata.length).toBeGreaterThan(10);
  }));

  test('Get offer price', () => pMap.offerPrice.prom.then((data) => {
    expect(data.pricedata['18047']).toStrictEqual({ nflplayerID: 18047, bestbid: 100, bestask: 0 });
  }));

  test('Get cancelled offer price', () => pMap.cancelPrice.prom.then((data) => {
    expect(data.pricedata['18047']).toStrictEqual({ nflplayerID: 18047, bestbid: 0, bestask: 0 });
  }));

  test('Protected match', () => pMap.protMatch.prom.then((data) => {
    expect(data.event).toBe('protectedMatch');
    expect(data.expire).toBeGreaterThan(1628312008593);
  }), 10000);

  test('Offer fill', () => pMap.fillOffer.prom.then((data) => {
    expect(data.event).toBe('offerFilled');
  }), 10000 + config.ProtectionDelay * 1000);
});

/*

Successfully connect to WS
Pull initial price info
Pull leaderboard

Create offer -> Price update
Cancel offer -> offer cancelled
Stat update
Phase change

Create offer (unprotected and protected across 2 users)
    Protmatch
    offerFilled

*****

Create new unresolved promise for each test
    Mark res and rej fns

Initusers and return session IDs
Initws and return event emitters
on message, switch between message types
    if message fulfills test, resolve, else reject

Send requests

*/