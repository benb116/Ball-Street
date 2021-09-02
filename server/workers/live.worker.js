// Websocket server worker
// Subscribe to redis updates and push out to clients

const { promisify } = require('util');

const config = require('../config');

const liveState = require('./live/livestate'); // Data stored in memory
require('./live/liveserver'); // WS server

// Two clients - one to subscribe, one to read and write
const { client, subscriber, rediskeys } = require('../db/redis');
const logger = require('../utilities/logger');

const { leaderHash } = rediskeys;
const getAsync = promisify(client.get).bind(client);

subscriber.subscribe('priceUpdate');
subscriber.subscribe('statUpdate');
subscriber.subscribe('lastTrade');
subscriber.subscribe('leaderUpdate');
subscriber.subscribe('protectedMatch');
subscriber.subscribe('offerFilled');
subscriber.subscribe('offerCancelled');
subscriber.subscribe('phaseChange');

subscriber.on('message', (channel, message) => {
  if (message) logger.info(`${channel}: ${message}`);
  switch (channel) {
    case 'priceUpdate': priceUpdate(message); break;
    case 'statUpdate': statUpdate(message); break;
    case 'lastTrade': lastTrade(message); break;
    case 'leaderUpdate': leaderUpdate(); break;
    case 'protectedMatch': protectedMatch(message); break;
    case 'offerFilled': offerFilled(message); break;
    case 'offerCancelled': offerCancelled(message); break;
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
    nflplayerID,
    bestbid,
    bestask,
  };
}

function statUpdate(message) {
  const { nflplayerID, statPrice, projPrice } = JSON.parse(message);
  liveState.statUpdateMap[nflplayerID] = { nflplayerID };
  if (statPrice !== null) { liveState.statUpdateMap[nflplayerID].statPrice = statPrice; }
  if (projPrice !== null) { liveState.statUpdateMap[nflplayerID].projPrice = projPrice; }
}

// Add a last trade update to the map
function lastTrade(message) {
  const { contestID, nflplayerID, lastprice } = JSON.parse(message);
  if (!liveState.lastTradeMap[contestID]) { liveState.lastTradeMap[contestID] = {}; }
  liveState.lastTradeMap[contestID][nflplayerID] = {
    nflplayerID,
    lastprice,
  };
}

// When new leaderboards come in, send out to the correct ws
function leaderUpdate() {
  const leaderMemo = {};
  liveState.contestmap.forEach(async (thecontestID, thews) => {
    if (!thews) { liveState.contestmap.delete(thews); return; }
    if (!leaderMemo[thecontestID]) {
      const out = await getAsync(leaderHash(thecontestID));
      leaderMemo[thecontestID] = JSON.parse(out);
    }
    if (thews.readyState === 1) {
      thews.send(JSON.stringify({ event: 'leaderboard', leaderboard: leaderMemo[thecontestID] }));
    }
  });
}

// When the game phase changes
function phaseChange(message) {
  liveState.contestmap.forEach(async (thecontestID, thews) => {
    if (!thews) { liveState.contestmap.delete(thews); return; }
    if (thews.readyState === 1) {
      thews.send(JSON.stringify({ event: 'phaseChange', phase: JSON.parse(message) }));
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

// When a offer is cancelled, alert the user via ws
function offerCancelled(message) {
  const { userID, offerID } = JSON.parse(message);
  const thews = liveState.connmap.get(userID);
  if (!thews) { liveState.connmap.delete(userID); return; }
  thews.send(JSON.stringify({ event: 'offerCancelled', offerID }));
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

  if (Object.keys(liveState.statUpdateMap).length) {
    liveState.contestmap.forEach((thecontestID, thews) => {
      if (!thews) { liveState.contestmap.delete(thews); return; }
      if (thews.readyState === 1) {
        thews.send(JSON.stringify({ event: 'statUpdate', pricedata: liveState.statUpdateMap }));
      }
    });
    liveState.statUpdateMap = {};
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
