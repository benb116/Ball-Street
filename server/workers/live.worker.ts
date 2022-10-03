// Websocket server worker
// Subscribe to redis updates and push out to clients

import WebSocket from 'ws';
import http from 'http';
import express, { Request } from 'express';

import session from '@server/middleware/session';
import logger from '@server/utilities/logger';

import { subscriber } from '@db/redis';
import bestbid from '@db/redis/bestbid.redis';
import bestask from '@db/redis/bestask.redis';
import lasttrade from '@db/redis/lasttrade.redis';
import statprice from '@db/redis/statprice.redis';
import projprice from '@db/redis/projprice.redis';
import projAvg from '@db/redis/projAvg.redis';
import channelMap from './live/channels.live';
import liveState from './live/state.live'; // Data stored in memory

// All channels that may be used

// Set up redis subscribers
(async () => {
  await subscriber.connect();
  Object.keys(channelMap).forEach((c) => {
    subscriber.subscribe(c, (message, channel) => {
      // When a message comes in, dispatch it to correct subscriber fn
      channelMap[channel].sub(message);
    }).catch(logger.error);
  });
})();

// WS server on top of express
const app = express();
app.use(session);
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request: Request, socket, head) => {
  // @ts-expect-error Second arg is unnecessary, just give empty obj
  session(request, {}, () => {
    if (!request.session.user) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });
});

// New ws connection
wss.on('connection', async (ws, request: Request) => {
  if (!request.session.user) {
    ws.send('No user found');
    return;
  }
  // Add to connection map (ws <-> user)
  const userId = request.session.user.id;
  liveState.connmap.set(userId, ws);

  // Add to contest map (ws <-> contest)
  const requestTerms = request.url.split('/');
  const contestID = Number(requestTerms[requestTerms.length - 1]);
  liveState.contestmap.delete(ws);
  liveState.contestmap.set(ws, contestID);

  // Send starting data
  ws.send(JSON.stringify({ event: 'priceUpdate', pricedata: await sendLatest(contestID) }));
  ws.send(JSON.stringify({
    event: 'contestAvg',
    average: await projAvg.get(contestID) || 0,
  }));

  ws.on('close', () => {
    liveState.connmap.delete(userId);
    liveState.contestmap.delete(ws);
  });
});

server.listen(process.env.LIVE_PORT, () => {
  logger.info(`Live server listening on port ${process.env.LIVE_PORT}`);
});

// Send latest points and stat info
async function sendLatest(contestID: number) {
  const stats = statprice.getall();
  const projs = projprice.getall();
  const bbids = bestbid.getall(contestID);
  const basks = bestask.getall(contestID);
  const lasts = lasttrade.getall(contestID);
  return Promise.all([stats, projs, bbids, basks, lasts]).then((out) => {
    type ValueOut = Record<number, number>;

    const statsOut = out[0];
    const projsOut = out[1];
    const bbidsOut = out[2];
    const basksOut = out[3];
    const lastsOut = out[4];

    interface LatestItem {
      statPrice: number,
      projPrice: number,
      bestbid: number,
      bestask: number,
      lastprice: number,
      nflplayerID: number,
    }
    const retobj: Record<string, LatestItem> = {};

    function buildObj(outobj: ValueOut, label: string) {
      if (outobj) {
        Object.keys(outobj).forEach((p) => {
          const np = Number(p);
          if (!retobj[np]) {
            retobj[np] = {
              statPrice: 0,
              projPrice: 0,
              bestbid: 0,
              bestask: 0,
              lastprice: 0,
              nflplayerID: np,
            };
          }
          if (label === 'statPrice') retobj[np].statPrice = Number(outobj[np]);
          if (label === 'projPrice') retobj[np].projPrice = Number(outobj[np]);
          if (label === 'bestbid') retobj[np].bestbid = Number(outobj[np]);
          if (label === 'bestask') retobj[np].bestask = Number(outobj[np]);
          if (label === 'lastprice') retobj[np].lastprice = Number(outobj[np]);
        });
      }
    }
    buildObj(statsOut, 'statPrice');
    buildObj(projsOut, 'projPrice');
    buildObj(bbidsOut, 'bestbid');
    buildObj(basksOut, 'bestask');
    buildObj(lastsOut, 'lastprice');
    return retobj;
  });
}
