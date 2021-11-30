import config from '../../../config';
import liveState from '../state.live'; // Data stored in memory
import { sendToContests } from '../socket.live';

import { client } from '../../../db/redis';

const priceUpdate = {

  pubBest: function pub(contestID: number, nflplayerID: number, bestbid: number, bestask: number) {
    client.publish('priceUpdate', JSON.stringify({
      contestID,
      nflplayerID,
      bestbid,
      bestask,
    }));
  },

  pubLast: function pub(contestID: number, nflplayerID: number, lastprice: number) {
    client.publish('priceUpdate', JSON.stringify({
      contestID,
      nflplayerID,
      lastprice,
    }));
  },

  // Add a price update to the map
  sub: function sub(message: string) {
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
  },
};

// Send out new price data when it's available
setInterval(() => {
  const priceUpdatecIDs = Object.keys(liveState.priceUpdateMap);

  const priceMsgMap = priceUpdatecIDs.reduce((acc, cur) => {
    acc[cur] = { event: 'priceUpdate', pricedata: liveState.priceUpdateMap[cur] };
    return acc;
  }, {});
  liveState.priceUpdateMap = {};

  sendToContests(priceMsgMap);
}, config.RefreshTime * 1000);

export default priceUpdate;