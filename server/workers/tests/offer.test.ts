/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-console */
import WebSocket from 'ws';
import axios from 'axios';

import createOffer from '../../features/offer/services/createOffer.service';
import { TestPromiseMap } from '../../features/util/util.tests';
import bestbid from '../../db/redis/bestbid.redis';
import bestask from '../../db/redis/bestask.redis';
import { ProtectionDelay, RefreshTime } from '../../config';
import { isUError } from '../../features/util/util';

const contestID = 3;

const tests = [
  'init',
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
const pMap = TestPromiseMap(tests);

function reqBody(user = 1, nflplayerID = 21, isbid = false, price = 500, isProtected = false) {
  return {
    user,
    params: {
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
      // eslint-disable-next-line no-console
      console.log(err);
      throw new Error('Could not init session');
    });
}

function initWS(cookie: string) {
  return new WebSocket(`ws://localhost/ballstreetlive/contest/${contestID}`, {
    headers: { cookie },
  });
}

async function run() {
  await bestbid.set(contestID, 21, 0);
  await bestask.set(contestID, 21, 0);

  const session1 = await getSessionID('email1@gmail.com');
  if (!session1) return;
  const ws1 = initWS(session1);

  let cancelOffer = '';
  let ignoreFirst = true;

  ws1.on('message', async (text: string) => {
    const msg = JSON.parse(text.toString());
    switch (msg.event) {
      case 'offerFilled':
        if (!pMap['fillNot']!.done) {
          pMap['fillNot']!.done = true;
          pMap['fillNot']!.res(msg);
        } else if (!pMap['matchUnprotected']!.done) {
          pMap['matchUnprotected']!.done = true;
          if (msg.offerID === cancelOffer) {
            pMap['matchUnprotected']!.rej(msg);
          } else {
            pMap['matchUnprotected']!.res(msg);
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
        if (ignoreFirst) {
          ignoreFirst = false;
          return;
        }
        if (!pMap['offer1']!.done) {
          pMap['offer1']!.done = true;
          pMap['offer1']!.res(msg);
          const out = await createOffer(reqBody(2, 21, true, 400, true));
          if (isUError(out)) throw out;
          cancelOffer = out.id;
        } else if (!pMap['nonMatch']!.done) {
          pMap['nonMatch']!.done = true;
          pMap['nonMatch']!.res(msg);
          await createOffer(reqBody(3, 21, true, 500)).catch(console.log);
        } else if (!pMap['match']!.done) {
          pMap['match']!.done = true;
          pMap['match']!.res(msg);
          await createOffer(reqBody(1, 21, true, 300)).catch(console.log);
          await createOffer(reqBody(3, 21, false, 300)).catch(console.log);
        }
        break;
      default:
        break;
    }
  });
  await createOffer(reqBody()).catch(console.log);
}

async function run2() {
  const session2 = await getSessionID('email2@gmail.com');
  if (!session2) return;
  const ws2 = initWS(session2);

  ws2.on('message', async (text: string) => {
    const msg = JSON.parse(text.toString());
    switch (msg.event) {
      case 'offerFilled':
        if (!pMap['fillProtected']!.done) {
          pMap['fillProtected']!.done = true;
          pMap['fillProtected']!.res(msg);
        }
        break;
      case 'protectedMatch':
        if (!pMap['matchProtected']!.done) {
          pMap['matchProtected']!.done = true;
          pMap['matchProtected']!.res(msg);
        }
        break;
      default:
        break;
    }
  });
  pMap['init']!.res(true);
}

beforeAll(() => { run().then(run2); });

describe('Offer matching tests', () => {
  test('Initialization', () => pMap['init']!.prom.then((data) => {
    expect(data).toEqual(true);
  }));

  test('Price update on offer', () => pMap['offer1']!.prom.then((data) => {
    expect(data.pricedata).toEqual(expect.objectContaining({
      21: { bestask: 500, bestbid: 0, nflplayerID: 21 },
    }));
  }), (RefreshTime + 10) * 1000);

  test('Price update on non-match', () => pMap['nonMatch']!.prom.then((data) => {
    expect(data.pricedata).toEqual(expect.objectContaining({
      21: { bestask: 500, bestbid: 400, nflplayerID: 21 },
    }));
  }), (RefreshTime + 10) * 1000);

  test('New best prices update on fill', () => pMap['match']!.prom.then((data) => {
    expect(data.pricedata).toEqual(expect.objectContaining({
      21: {
        bestask: 0, bestbid: 400, lastprice: 500, nflplayerID: 21,
      },
    }));
  }), (RefreshTime + 10) * 1000);

  test('Notify on fill', () => pMap['fillNot']!.prom.then((data) => {
    expect(data).toEqual(expect.objectContaining({ event: 'offerFilled' }));
    expect(data.offerID).toHaveLength(36);
  }), (RefreshTime + 10) * 1000);

  test('Fill better before protected', () => pMap['matchUnprotected']!.prom.then((data) => {
    expect(data).toEqual(expect.objectContaining({ event: 'offerFilled' }));
    expect(data.offerID).toHaveLength(36);
  }), (RefreshTime + 10) * 1000);

  test('Match notification', () => pMap['matchProtected']!.prom.then((data) => {
    expect(data).toEqual(expect.objectContaining({ event: 'protectedMatch' }));
    expect(data.offerID).toHaveLength(36);
    expect(data.expire).toBeGreaterThan(1629167862185);
  }), ProtectionDelay * 1000 + 5000);

  test('Fill protected', () => pMap['fillProtected']!.prom.then((data) => {
    expect(data).toEqual(expect.objectContaining({ event: 'offerFilled' }));
    expect(data.offerID).toHaveLength(36);
  }), ProtectionDelay * 1000 + 5000);
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
