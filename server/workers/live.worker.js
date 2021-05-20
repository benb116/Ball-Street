// Websocket server worker
// Subscribe to redis updates and push out to clients

const redis = require('redis');
const { promisify } = require('util');

const config = require('../config');
const { leaderHashkey } = require('../db/redisSchema');

const liveState = require('./live/livestate'); // Data stored in memory
require('./live/liveserver'); // WS server

// Two clients - one to subscribe, one to read and write
const client = redis.createClient();
const client2 = redis.createClient();
const getAsync = promisify(client2.get).bind(client2);

client.subscribe('priceUpdate');
client.subscribe('lastTrade');
client.subscribe('leaderUpdate');
client.subscribe('protectedMatch');
client.subscribe('offerFilled');
client.subscribe('phaseChange');

client.on('message', (channel, message) => {
  switch (channel) {
    case 'priceUpdate': priceUpdate(message); break;
    case 'lastTrade': lastTrade(message); break;
    case 'leaderUpdate': leaderUpdate(); break;
    case 'protectedMatch': protectedMatch(message); break;
    case 'offerFilled': offerFilled(message); break;
    case 'phaseChange': phaseChange(message); break;
    default: break;
  }
});

// Add a price update to the map
function priceUpdate(message) {
  const {
    contestID, nflplayerID, bestbid, bestask,
  } = JSON.parse(message);
  if (!liveState.priceUpdateMap[contestID]) { liveState.priceUpdateMap[contestID] = {}; }
  liveState.priceUpdateMap[contestID][nflplayerID] = {
    bestbid: Number(bestbid),
    bestask: Number(bestask),
    nflplayerID,
  };
}

// Add a last trade update to the map
function lastTrade(message) {
  const { contestID, nflplayerID, lastprice } = JSON.parse(message);
  if (!liveState.lastTradeMap[contestID]) { liveState.lastTradeMap[contestID] = {}; }
  liveState.lastTradeMap[contestID][nflplayerID] = { lastprice: Number(lastprice), nflplayerID };
}

// When new leaderboards come in, send out to the correct ws
function leaderUpdate() {
  const leaderMemo = {};
  liveState.contestmap.forEach(async (thecontestID, thews) => {
    if (!thews) { liveState.contestmap.delete(thews); return; }
    if (!leaderMemo[thecontestID]) {
      const out = await getAsync(leaderHashkey(thecontestID));
      leaderMemo[thecontestID] = JSON.parse(out);
    }
    if (thews.readyState === 1) {
      thews.send(JSON.stringify({ event: 'leaderboard', leaderboard: leaderMemo[thecontestID] }));
    }
  });
}

// When new leaderboards come in, send out to the correct ws
function phaseChange(message) {
  liveState.contestmap.forEach(async (thecontestID, thews) => {
    if (!thews) { liveState.contestmap.delete(thews); return; }
    if (thews.readyState === 1) {
      thews.send(JSON.stringify({ event: 'phaseChange', phase: message }));
    }
  });
}

// When a protected match is made, alert the user via ws
function protectedMatch(message) {
  const { userID, offerID, expire } = JSON.parse(message);
  const thews = liveState.connmap.get(userID);
  if (!thews) { liveState.connmap.delete(userID); return; }
  thews.send(JSON.stringify({ event: 'protectedMatch', offerID, expire }));
}

// When a offer is filled, alert the user via ws
function offerFilled(message) {
  const { userID, offerID } = JSON.parse(message);
  const thews = liveState.connmap.get(userID);
  if (!thews) { liveState.connmap.delete(userID); return; }
  thews.send(JSON.stringify({ event: 'offerFilled', offerID }));
}

// Send out new price data when it's available
setInterval(() => {
  if (Object.keys(liveState.priceUpdateMap).length) {
    liveState.contestmap.forEach((thecontestID, thews) => {
      if (!thews) { liveState.contestmap.delete(thews); return; }
      if (!liveState.priceUpdateMap[thecontestID]) { return; }
      if (thews.readyState === 1) {
        thews.send(JSON.stringify({ event: 'priceUpdate', pricedata: liveState.priceUpdateMap[thecontestID] }));
      }
    });
    liveState.priceUpdateMap = {};
  }

  if (Object.keys(liveState.lastTradeMap).length) {
    liveState.contestmap.forEach((thecontestID, thews) => {
      if (!thews) { liveState.contestmap.delete(thews); return; }
      if (!liveState.lastTradeMap[thecontestID]) { return; }
      if (thews.readyState === 1) {
        thews.send(JSON.stringify({ event: 'priceUpdate', pricedata: liveState.lastTradeMap[thecontestID] }));
      }
    });
    liveState.lastTradeMap = {};
  }
}, config.RefreshTime * 1000);
