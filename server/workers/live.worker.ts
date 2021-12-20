// Websocket server worker
// Subscribe to redis updates and push out to clients

import WebSocket from 'ws';
import http from 'http';
import express, { Request } from 'express';

import { client, subscriber, rediskeys } from '../db/redis';
import session from '../middleware/session';
import liveState from './live/state.live'; // Data stored in memory
import logger from '../utilities/logger';

// All channels that may be used
import channelMap from './live/channels.live';

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
    event: 'leaderboard',
    leaderboard: JSON.parse(await client.GET(rediskeys.leaderHash(contestID)) || '[]'),
  }));

  ws.on('close', () => {
    liveState.connmap.delete(userId);
    liveState.contestmap.delete(ws);
  });
});

server.listen(process.env.LIVE_PORT, () => {
  logger.info(`Live server listening on port ${process.env.PORT}`);
});

// Send latest points and stat info
async function sendLatest(contestID: number) {
  const stats = client.HGETALL(rediskeys.statpriceHash());
  const projs = client.HGETALL(rediskeys.projpriceHash());
  const bbids = client.HGETALL(rediskeys.bestbidHash(contestID));
  const basks = client.HGETALL(rediskeys.bestaskHash(contestID));
  const lasts = client.HGETALL(rediskeys.lasttradeHash(contestID));
  return Promise.all([stats, projs, bbids, basks, lasts]).then((out) => {
    interface ValueOut {
      [key: string]: string
    }
    const statsOut: ValueOut = out[0];
    const projsOut: ValueOut = out[1];
    const bbidsOut: ValueOut = out[2];
    const basksOut: ValueOut = out[3];
    const lastsOut: ValueOut = out[4];

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
        Object.keys(outobj).forEach((p: string) => {
          if (!retobj[p]) {
            retobj[p] = {
              statPrice: 0,
              projPrice: 0,
              bestbid: 0,
              bestask: 0,
              lastprice: 0,
              nflplayerID: Number(p),
            };
          }
          if (label === 'statPrice') retobj[p].statPrice = Number(outobj[p]);
          if (label === 'projPrice') retobj[p].projPrice = Number(outobj[p]);
          if (label === 'bestbid') retobj[p].bestbid = Number(outobj[p]);
          if (label === 'bestask') retobj[p].bestask = Number(outobj[p]);
          if (label === 'lastprice') retobj[p].lastprice = Number(outobj[p]);
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
