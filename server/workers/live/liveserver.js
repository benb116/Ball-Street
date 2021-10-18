// Main websocket server code

const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const { get, rediskeys } = require('../../db/redis');

const session = require('../../middleware/session');

const liveState = require('./livestate'); // Data stored in memory

const logger = require('../../utilities/logger');

// WS server on top of express
const app = express();
app.use(session);
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
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
wss.on('connection', async (ws, request) => {
  // Add to connection map (ws <-> user)
  const userId = request.session.user.id;
  liveState.connmap.set(userId, ws);

  // Add to contest map (ws <-> contest)
  const requestTerms = request.url.split('/');
  const contestID = requestTerms[requestTerms.length - 1];
  liveState.contestmap.delete(ws);
  liveState.contestmap.set(ws, contestID);

  // Send starting data
  ws.send(JSON.stringify({ event: 'priceUpdate', pricedata: await sendLatest(contestID) }));
  ws.send(JSON.stringify({ event: 'leaderboard', leaderboard: JSON.parse(await get.key(rediskeys.leaderHash(contestID))) }));

  ws.on('close', () => {
    liveState.connmap.delete(userId);
    liveState.contestmap.delete(ws);
  });
});

server.listen(process.env.PORT, () => {
  logger.info(`Live server listening on port ${process.env.PORT}`);
});

// Send latest points and stat info
async function sendLatest(contestID) {
  const stats = get.hkeyall(rediskeys.statpriceHash());
  const projs = get.hkeyall(rediskeys.projpriceHash());
  const bbids = get.hkeyall(rediskeys.bestbidHash(contestID));
  const basks = get.hkeyall(rediskeys.bestaskHash(contestID));
  const lasts = get.hkeyall(rediskeys.lasttradeHash(contestID));
  return Promise.all([stats, projs, bbids, basks, lasts]).then((out) => {
    const [statsOut, projsOut, bbidsOut, basksOut, lastsOut] = out;
    const retobj = {};

    function buildObj(arr, label) {
      if (arr) {
        Object.keys(arr).forEach((p) => {
          if (!retobj[p]) retobj[p] = {};
          retobj[p].nflplayerID = Number(p);
          retobj[p][label] = Number(arr[p]);
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
