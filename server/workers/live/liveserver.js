const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const { promisify } = require('util');

const { client, rediskeys, get } = require('../../db/redis');

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

wss.on('connection', async (ws, request) => {
  const userId = request.session.user.id;
  liveState.connmap.set(userId, ws);

  const contestID = request.url.split('/')[2];
  liveState.contestmap.delete(ws);
  liveState.contestmap.set(ws, contestID);

  // Send starting data
  const out = await sendLatest(contestID);
  ws.send(JSON.stringify(out.filter((e) => e !== null)));

  const phase = await get.GamePhase();
  ws.send(JSON.stringify({ event: 'phaseChange', phase }));

  ws.on('close', () => {
    liveState.connmap.delete(userId);
    liveState.contestmap.delete(ws);
  });
});

server.listen(8080, () => {
  // eslint-disable-next-line no-console
  console.log('Listening on port 8080');
});

let playerIDs = [];

(async () => {
  const out = await playerService.getNFLPlayers();
  playerIDs = out.map((p) => p.id);
})();

async function sendLatest(contestID) {
  const outPromises = playerIDs
    .map((p) => {
      const rkey = rediskeys.hash(contestID, p);
      return hgetallAsync(rkey).then((obj) => {
        if (!obj) { return null; }
        const out = obj;
        out.contestID = contestID;
        out.nflplayerID = p;
        return out;
      });
    });
  return Promise.all(outPromises);
}
