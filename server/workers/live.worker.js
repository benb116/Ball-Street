// Websocket server worker
// Subscribe to redis updates and push out to clients
const config = require('../config');

const liveState = require('./live/state.live'); // Data stored in memory
require('./live/server.live'); // WS server

// Two clients - one to subscribe, one to read and write
const { get, subscriber, rediskeys } = require('../db/redis');
const logger = require('../utilities/logger');
const { sendToUser, sendToAll, sendToContests } = require('./live/socket.live');

const { leaderHash } = rediskeys;

subscriber.subscribe('priceUpdate');
subscriber.subscribe('statUpdate');
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
    contestID, nflplayerID, bestbid, bestask, lastprice,
  } = JSON.parse(message);
  if (!liveState.priceUpdateMap[contestID]) { liveState.priceUpdateMap[contestID] = {}; }
  if (!liveState.priceUpdateMap[contestID][nflplayerID]) {
    liveState.priceUpdateMap[contestID][nflplayerID] = {};
  }

  liveState.priceUpdateMap[contestID][nflplayerID].nflplayerID = nflplayerID;

  if (bestbid !== undefined) liveState.priceUpdateMap[contestID][nflplayerID].bestbid = bestbid;
  if (bestask !== undefined) liveState.priceUpdateMap[contestID][nflplayerID].bestask = bestask;
  if (lastprice !== undefined) liveState.priceUpdateMap[contestID][nflplayerID].lastprice = lastprice;
}

function statUpdate(message) {
  sendToAll({ event: 'statUpdate', pricedata: JSON.parse(message) });
}

// When new leaderboards come in, send out to the correct ws
function leaderUpdate() {
  const leaderMemo = {};
  liveState.contestmap.forEach(async (thecontestID) => {
    if (!leaderMemo[thecontestID]) {
      const out = await get.key(leaderHash(thecontestID));
      leaderMemo[thecontestID] = JSON.parse(out);
    }
  });
  const allcontests = Object.keys(leaderMemo);
  const leaderMsgMap = allcontests.reduce((acc, cur) => {
    acc[cur] = { event: 'leaderboard', leaderboard: leaderMemo[cur] };
    return acc;
  }, {});
  sendToContests(leaderMsgMap);
}

// When the game phase changes
function phaseChange(message) {
  sendToAll({ event: 'phaseChange', phase: JSON.parse(message) });
}

// When a protected match is made, alert the user via ws
function protectedMatch(message) {
  const { userID, offerID, expire } = JSON.parse(message);
  sendToUser(userID, { event: 'protectedMatch', offerID, expire });
}

// When a offer is filled, alert the user via ws
function offerFilled(message) {
  const { userID, offerID } = JSON.parse(message);
  sendToUser(userID, { event: 'offerFilled', offerID });
}

// When a offer is cancelled, alert the user via ws
function offerCancelled(message) {
  const { userID, offerID } = JSON.parse(message);
  sendToUser(userID, { event: 'offerCancelled', offerID });
}

// Send out new price data when it's available
setInterval(() => {
  const priceUpdatecIDs = Object.keys(liveState.priceUpdateMap);

  const priceMsgMap = priceUpdatecIDs.reduce((acc, cur) => {
    acc[cur] = { event: 'priceUpdate', pricedata: liveState.priceUpdateMap[cur] };
    return acc;
  }, {});

  sendToContests(priceMsgMap);
}, config.RefreshTime * 1000);
