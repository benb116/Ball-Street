const liveState = require('../state.live'); // Data stored in memory
const { sendToContests } = require('../socket.live');

const { get, rediskeys } = require('../../../db/redis');

const { leaderHash } = rediskeys;

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

module.exports = leaderUpdate;
