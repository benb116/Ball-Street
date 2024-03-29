/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-console */
import axios from 'axios';
import WebSocket from 'ws';

import { ProtectionDelay, RefreshTime } from '../../config';
import bestbid from '../../db/redis/bestbid.redis';
import Offer from '../../features/offer/offer.model';
import { TestPromiseMap } from '../../features/util/util.tests';

const contestID = 2;

function getSessionID(email: string) {
  return axios({
    method: 'post',
    url: 'http://localhost/app/auth/login',
    data: {
      email,
      password: 'password1',
    },
  }).then((resp) => {
    if (!resp.headers['set-cookie'] || !resp.headers['set-cookie'][0]) throw Error('No cookie');
    return resp.headers['set-cookie'][0].split(';')[0];
  })
    .catch((err) => {
      console.log(err);
      throw new Error('Could not init session');
    });
}

function initWS(cookie: string) {
  return new WebSocket(`ws://localhost/ballstreetlive/contest/${contestID}`, {
    headers: { cookie },
  });
}

function createOffer(cookie: string, isbid: boolean, price: number, isprotected: boolean) {
  return axios({
    method: 'post',
    url: `http://localhost/app/api/contests/${contestID}/offer/`,
    data: {
      nflplayerID: 28026,
      isbid,
      price,
      protected: isprotected,
    },
    headers: { cookie },
  }).catch((err) => {
    console.log(err);
    throw new Error('Could not create offer');
  });
}

async function cancelOffer(cookie: string) {
  const a = await axios({
    method: 'get',
    url: `http://localhost/app/api/contests/${contestID}/offers/`,
    headers: { cookie },
  }).then((offers) => offers.data.filter((o: Offer) => o.NFLPlayerId === 28026));
  if (!a.length) { return Promise.resolve(); }

  return axios({
    method: 'delete',
    url: `http://localhost/app/api/contests/${contestID}/offer/`,
    data: { offerID: a[0].id },
    headers: { cookie },
  }).catch((err) => {
    console.log(err);
    throw new Error('Could not create offer');
  });
}

const tests = [
  'init',
  'open1',
  'projAvg',
  'initPrice',
  'offerPrice',
  'cancelPrice',
  'protMatch',
  'matchPrice',
  'fillOffer',
  'clearPrice',
];
const pMap = TestPromiseMap(tests);

async function initUsers() {
  await Promise.all(Array.from(Array(11).keys()).map((n) => bestbid.set(contestID, n, 400)));

  const session1 = await getSessionID('email3@gmail.com');
  const session2 = await getSessionID('email2@gmail.com');
  if (!session1 || !session2) return;
  const ws1 = initWS(session1);
  // const ws2 = initWS(session2);
  ws1.on('open', () => {
    pMap['open1']!.res(true);
  });
  ws1.on('error', console.log);

  ws1.on('message', async (text: string) => {
    const msg = JSON.parse(text.toString());
    // console.log(msg);
    switch (msg.event) {
      case 'offerFilled':
        pMap['fillOffer']!.res(msg);
        break;
      case 'offerCancelled':
        break;
      case 'protectedMatch':
        pMap['protMatch']!.res(msg);
        break;
      case 'contestAvg':
        pMap['projAvg']!.res(true);
        break;
      case 'phaseChange':
        break;
      case 'priceUpdate':
        if (Object.keys(msg.pricedata).length > 10) {
          pMap['initPrice']!.res(msg);
        } else if (!pMap['offerPrice']!.done) {
          pMap['offerPrice']!.done = true;
          pMap['offerPrice']!.res(msg);
          await cancelOffer(session1);
        } else if (!pMap['cancelPrice']!.done) {
          pMap['cancelPrice']!.done = true;
          pMap['cancelPrice']!.res(msg);
          await createOffer(session1, true, 100, true);
          await (createOffer(session2, false, 100, false));
        } else if (!pMap['matchPrice']!.done) {
          pMap['matchPrice']!.done = true;
          pMap['matchPrice']!.res(msg);
        } else if (!pMap['clearPrice']!.done) {
          pMap['clearPrice']!.done = true;
          pMap['clearPrice']!.res(msg);
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

  pMap['init']!.res(true);
}

beforeAll(() => initUsers().catch(console.error));

describe('Live server tests', () => {
  test('Initialization', () => pMap['init']!.prom.then((data) => {
    expect(data).toEqual(true);
  }));

  test('Open WS connection', () => pMap['open1']!.prom.then((data) => {
    expect(data).toBe(true);
  }));

  test('Get projected average', () => pMap['projAvg']!.prom.then((data) => {
    expect(data).toBe(true);
  }), 12000);

  test('Get initial price', () => pMap['initPrice']!.prom.then((data) => {
    expect(Object.keys(data.pricedata).length).toBeGreaterThan(10);
  }));

  test('Get offer price', () => pMap['offerPrice']!.prom.then((data) => {
    expect(data.pricedata['28026']).toStrictEqual({
      nflplayerID: 28026, bestbid: 100, bestask: 0,
    });
  }), (RefreshTime + 1) * 1000);

  test('Get cancelled offer price', () => pMap['cancelPrice']!.prom.then((data) => {
    expect(data.pricedata['28026']).toStrictEqual({
      nflplayerID: 28026, bestbid: 0, bestask: 0,
    });
  }), (RefreshTime + 1) * 1000);

  test('Get matched offer prices', () => pMap['matchPrice']!.prom.then((data) => {
    expect(data.pricedata['28026']).toStrictEqual({
      nflplayerID: 28026, bestbid: 100, bestask: 100,
    });
  }), (RefreshTime + 1) * 1000);

  test('Protected match', () => pMap['protMatch']!.prom.then((data) => {
    expect(data.event).toBe('protectedMatch');
    expect(data.expire).toBeGreaterThan(1628312008593);
  }), 15000);

  test('Offer fill', () => pMap['fillOffer']!.prom.then((data) => {
    expect(data.event).toBe('offerFilled');
  }), 10000 + ProtectionDelay * 1000);

  test('Get cleared prices', () => pMap['clearPrice']!.prom.then((data) => {
    expect(data.pricedata['28026']).toStrictEqual({
      nflplayerID: 28026, bestbid: 0, bestask: 0, lastprice: 100,
    });
  }), 10000 + ProtectionDelay * 1000);
});
