const liveState = require('../state.live'); // Data stored in memory
const { sendToContests } = require('../socket.live');

const { get, rediskeys, client } = require('../../../db/redis');

const { leaderHash } = rediskeys;

const leaderUpdate = {};

leaderUpdate.pub = function pub() {
  client.publish('leaderUpdate', '');
};

// When new leaderboards come in, send out to the correct ws
leaderUpdate.sub = async function sub() {
  const leaderMemo = {};
  liveState.contestmap.forEach((thecontestID) => {
    if (!leaderMemo[thecontestID]) {
      leaderMemo[thecontestID] = null;
    }
  });
  const allContests = Object.keys(leaderMemo);
  const allLeaders = await Promise.all(allContests.map((cID) => get.key(leaderHash(cID))));
  const leaderMsgMap = allContests.reduce((acc, cur, i) => {
    acc[cur] = { event: 'leaderboard', leaderboard: JSON.parse(allLeaders[i]) };
    return acc;
  }, {});
  sendToContests(leaderMsgMap);
};

module.exports = leaderUpdate;
