// Websocket server worker
// Subscribe to redis updates and push out to clients

const WebSocket = require('ws');
const redis = require('redis');
const http = require('http');
const express = require('express');
const { promisify } = require('util');

const config = require('../config');
const { hashkey } = require('../db/redisSchema');
const playerService = require('../features/nflplayer/nflplayer.service');

const client = redis.createClient();
const client2 = redis.createClient();
const hgetallAsync = promisify(client2.hgetall).bind(client2);

const session = require('../middleware/session');

const connmap = new Map();
const contestmap = new Map();
const app = express();
app.use(session);

const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

client.subscribe('priceUpdate');
client.subscribe('lastTrade');
client.subscribe('protectedMatch');
client.subscribe('offerFilled');

let priceUpdateMap = {}; // Keep an account of changes, will be flushed on interval
let lastTradeMap = {}; // Keep an account of changes, will be flushed on interval

client.on('message', (channel, message) => {
  console.log(channel, message);
  switch (channel) {
    case 'priceUpdate': priceUpdate(message); break;
    case 'lastTrade': lastTrade(message); break;
    case 'protectedMatch': protectedMatch(message); break;
    case 'offerFilled': offerFilled(message); break;
    default: break;
  }
});

function priceUpdate(message) {
  const { contestID, nflplayerID, bestbid, bestask, } = JSON.parse(message);
  if (!priceUpdateMap[contestID]) { priceUpdateMap[contestID] = {}; }
  priceUpdateMap[contestID][nflplayerID] = { bestbid, bestask, nflplayerID };
}

function lastTrade(message) {
  const { contestID, nflplayerID, lastprice } = JSON.parse(message);
  if (!lastTradeMap[contestID]) { lastTradeMap[contestID] = {}; }
  lastTradeMap[contestID][nflplayerID] = { lastprice, nflplayerID };
}

function protectedMatch(message) {
  const { userID, offerID } = JSON.parse(message);
  const thews = connmap.get(userID);
  thews.send(JSON.stringify({ event: 'offerMatched', offerID }));
}

function offerFilled(message) {
  const { userID, offerID } = JSON.parse(message);
  const thews = connmap.get(userID);
  console.log(userID, thews);
  thews.send(JSON.stringify({ event: 'offerFilled', offerID }));
}

server.on('upgrade', (request, socket, head) => {
  console.log('Parsing session from request...');

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

wss.on('connection', (ws, request) => {
  const userId = request.session.user.id;

  connmap.set(userId, ws);

  ws.on('message', async (msg) => {
    msg = JSON.parse(msg);
    contestmap.delete(ws);
    // Send starting data
    const out = await sendLatest(msg.contestID);
    ws.send(JSON.stringify(out));
    contestmap.set(ws, msg.contestID);
  });

  ws.on('close', () => {
    connmap.delete(userId);
    contestmap.delete(ws);
  });
});

let playerIDs = [];

(async () => {
  const out = await playerService.getNFLPlayers();
  playerIDs = out.map(p => p.id);
})();

async function sendLatest(contestID) {
  const outPromises = playerIDs
  .map(p => {
    const rkey = hashkey(contestID, p);
    return hgetallAsync(rkey).then((obj) => {
      if (!obj) { return null; }
      const out = obj;
      out.contestID = contestID;
      out.nflplayerID = p;
      return out;
    });
  })
  return Promise.all(outPromises);
}

// Send out new data when it's available
setInterval(() => {
  if (Object.keys(priceUpdateMap).length) {
    contestmap.forEach((thecontestID, thews) => {
      if (thews.readyState === 1) {
        thews.send(JSON.stringify({event: 'priceUpdate', pricedata: priceUpdateMap[thecontestID]}));
      }
    });
    priceUpdateMap = {};
  }

  if (Object.keys(lastTradeMap).length) {
    contestmap.forEach((thecontestID, thews) => {
      if (thews.readyState === 1) {
        thews.send(JSON.stringify({event: 'priceUpdate', pricedata: lastTradeMap[thecontestID]}));
      }
    });
    lastTradeMap = {};
  }
}, config.RefreshTime * 1000);

server.listen(8080, () => {
  console.log('Listening on port 8080');
});
