const config = require('../../../config');
const liveState = require('../state.live'); // Data stored in memory
const { sendToContests } = require('../socket.live');

const { client } = require('../../../db/redis');

const priceUpdate = {};

priceUpdate.pubBest = function pub(contestID, nflplayerID, bestbid, bestask) {
  client.publish('priceUpdate', JSON.stringify({
    contestID,
    nflplayerID,
    bestbid,
    bestask,
  }));
};

priceUpdate.pubLast = function pub(contestID, nflplayerID, lastprice) {
  client.publish('priceUpdate', JSON.stringify({
    contestID,
    nflplayerID,
    lastprice,
  }));
};

// Add a price update to the map
priceUpdate.sub = function sub(message) {
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
  // eslint-disable-next-line max-len
  if (lastprice !== undefined) liveState.priceUpdateMap[contestID][nflplayerID].lastprice = lastprice;
};

// Send out new price data when it's available
setInterval(() => {
  const priceUpdatecIDs = Object.keys(liveState.priceUpdateMap);

  const priceMsgMap = priceUpdatecIDs.reduce((acc, cur) => {
    acc[cur] = { event: 'priceUpdate', pricedata: liveState.priceUpdateMap[cur] };
    return acc;
  }, {});

  sendToContests(priceMsgMap);
}, config.RefreshTime * 1000);

module.exports = priceUpdate;
