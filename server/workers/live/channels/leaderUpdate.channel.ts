import liveState from '../state.live'; // Data stored in memory

import { MessageMapType, sendToContests } from '../socket.live';

import { client } from '../../../db/redis';
import leader from '../../../db/redis/leaderboard.redis';

const leaderUpdate = {
  pub: function pub() {
    client.publish('leaderUpdate', '');
  },
  // When new leaderboards come in, send out to the correct ws
  sub: async function sub() {
    const leaderMemo: Record<number, null> = {};
    liveState.contestmap.forEach((thecontestID) => {
      if (!leaderMemo[thecontestID]) {
        leaderMemo[thecontestID] = null;
      }
    });
    const allContests = Object.keys(leaderMemo).map(Number);
    const allLeaders = await Promise.all(
      allContests.map((cID) => leader.get(cID)),
    );
    const leaderMsgMap = allContests.reduce((acc, cur, i) => {
      const thisLeader = allLeaders[i];
      if (!thisLeader) return acc;
      acc[cur] = { event: 'leaderboard', leaderboard: thisLeader };
      return acc;
    }, {} as MessageMapType);
    sendToContests(leaderMsgMap);
  },
};

export default leaderUpdate;
