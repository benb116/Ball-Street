import { client } from '../../../db/redis';
import projAvg from '../../../db/redis/projAvg.redis';
import { MessageMapType, sendToContests } from '../socket.live';
import liveState from '../state.live'; // Data stored in memory

const projAvgUpdate = {
  pub: function pub() {
    client.publish('projAvgUpdate', '');
  },
  // When new contest averagers come in, send out to the correct ws
  sub: async function sub() {
    const allContests = Array.from(liveState.contestmap.keys());
    if (!allContests.length) return;
    const allAvgs = await projAvg.get(allContests);
    const avgMsgMap = allContests.reduce((acc, cur, i) => {
      const thisAverage = allAvgs[i];
      if (thisAverage === null || thisAverage === undefined) return acc;
      acc.set(cur, { event: 'contestAvg', average: thisAverage });
      return acc;
    }, new Map() as MessageMapType);
    sendToContests(avgMsgMap);
  },
};

export default projAvgUpdate;
