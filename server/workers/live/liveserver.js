// Main websocket server code

const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const { promisify } = require('util');

const { client, rediskeys } = require('../../db/redis');

const hgetallAsync = promisify(client.hgetall).bind(client);

const session = require('../../middleware/session');

const liveState = require('./livestate'); // Data stored in memory

const playerService = require('../../features/nflplayer/nflplayer.service');

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
  const out = await sendLatest(contestID);
  ws.send(JSON.stringify({ event: 'priceUpdate', pricedata: out.filter((e) => e !== null) }));

  ws.on('close', () => {
    liveState.connmap.delete(userId);
    liveState.contestmap.delete(ws);
  });
});

server.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${process.env.PORT}`);
});

// Get latest price data
let playerIDs = [];

(async () => {
  const out = await playerService.getNFLPlayers();
  playerIDs = out.map((p) => p.id);
})();

async function sendLatest(contestID) {
  const outPromises = playerIDs
    .map((p) => {
      const contestPromise = hgetallAsync(rediskeys.hash(contestID, p));
      const statPromise = hgetallAsync(rediskeys.statHash(p));
      return Promise.all([contestPromise, statPromise]).then((objarr) => {
        if (!objarr) { return null; }
        const out = { ...objarr[0], ...objarr[1] };
        out.nflplayerID = p;
        return out;
      });
    });
  return Promise.all(outPromises);
}
