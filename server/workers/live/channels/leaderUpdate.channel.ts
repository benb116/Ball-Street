import liveState from '../state.live'; // Data stored in memory

import { MessageMapType, sendToContests } from '../socket.live';

import { rediskeys, client } from '../../../db/redis';

const { leaderHash } = rediskeys;

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
    const allContests = Object.keys(leaderMemo);
    const allLeaders = await Promise.all(
      allContests.map((cID) => client.GET(leaderHash(Number(cID)))),
    );
    const leaderMsgMap = allContests.reduce((acc, cur, i) => {
      acc[cur] = { event: 'leaderboard', leaderboard: JSON.parse(allLeaders[i] || '[]') };
      return acc;
    }, {} as MessageMapType);
    sendToContests(leaderMsgMap);
  },
};

export default leaderUpdate;
