import { RefreshTime } from '@server/config';

import { client } from '@db/redis';
import liveState from '../state.live'; // Data stored in memory

import { MessageMapType, sendToContests } from '../socket.live';

const priceUpdate = {
  pub: function pub(type: 'best' | 'last', contestID: number, nflplayerID: number, bestbid: number, bestask: number) {
    if (type === 'best') {
      client.publish('priceUpdate', JSON.stringify({
        contestID,
        nflplayerID,
        bestbid,
        bestask,
      }));
    }
    if (type === 'last') {
      client.publish('priceUpdate', JSON.stringify({
        contestID,
        nflplayerID,
        lastprice: bestbid,
      }));
    }
  },

  // Add a price update to the map
  sub: function sub(message: string) {
    const {
      contestID, nflplayerID, bestbid, bestask, lastprice,
    } = JSON.parse(message);
    if (!liveState.priceUpdateMap[contestID]) { liveState.priceUpdateMap[contestID] = {}; }
    if (!liveState.priceUpdateMap[contestID][nflplayerID]) {
      liveState.priceUpdateMap[contestID][nflplayerID] = { nflplayerID };
    }

    if (bestbid !== undefined) liveState.priceUpdateMap[contestID][nflplayerID].bestbid = bestbid;
    if (bestask !== undefined) liveState.priceUpdateMap[contestID][nflplayerID].bestask = bestask;
    // eslint-disable-next-line max-len
    if (lastprice !== undefined) liveState.priceUpdateMap[contestID][nflplayerID].lastprice = lastprice;
  },
};

// Send out new price data when it's available
setInterval(() => {
  const priceUpdatecIDs = Object.keys(liveState.priceUpdateMap);

  const priceMsgMap = priceUpdatecIDs.reduce((acc, cur: string) => {
    acc[cur] = { event: 'priceUpdate', pricedata: liveState.priceUpdateMap[cur] };
    return acc;
  }, {} as MessageMapType);
  liveState.priceUpdateMap = {};

  sendToContests(priceMsgMap);
}, RefreshTime * 1000);

export default priceUpdate;
