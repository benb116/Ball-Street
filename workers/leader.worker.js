// Leader worker
// Calculates live leaderboards

const redis = require('redis');
const { promisify } = require('util');
const config = require('../config');
const { hashkey, leaderHashkey } = require('../db/redisSchema');

const client = redis.createClient();
const client2 = redis.createClient();
const hgetallAsync = promisify(client.hgetall).bind(client);

const entryService = require('../features/entry/entry.service');
const playerService = require('../features/nflplayer/nflplayer.service');

let playerIDs = [];

(async () => {
  const out = await playerService.getNFLPlayers();
  playerIDs = out.map((p) => p.id);
})();

async function sendLatest(contestID) {
  const outPromises = playerIDs
    .map((p) => {
      const rkey = hashkey(contestID, p);
      return hgetallAsync(rkey).then((obj) => {
        if (!obj) { return null; }
        const out = obj;
        out.contestID = contestID;
        out.nflplayerID = p;
        out.projPrice = getRandomInt(1000);
        return out;
      });
    });
  return Promise.all(outPromises);
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

async function calculateLeaderboard() {
  const rosterPositions = Object.keys(config.Roster);

  const weekentries = await entryService.getWeekEntries();
  const normalizedEntries = weekentries.map((e) => {
    const out = {};
    out.balance = e.pointtotal;
    out.roster = rosterPositions.reduce((acc, cur) => {
      if (e[cur]) { acc.push(e[cur]); }
      return acc;
    }, []);
    out.contest = e.ContestId;
    out.username = e.User.name;
    return out;
  });
    // console.log(normalizedEntries);

  const contests = normalizedEntries.map((e) => e.contest).filter(onlyUnique);
  const pricemaps = contests.map(sendLatest);
  const priceMap = await Promise.all(pricemaps)
    .then((arrs) => arrs.reduce((acc, cur, i) => {
      acc[contests[i]] = cur.filter((e) => e !== null).reduce((acc2, cur2) => {
        const out2 = acc2;
        out2[cur2.nflplayerID] = cur2;
        return out2;
      }, {});
      return acc;
    }, {}));
    // console.log(priceMap);

  const projTotals = normalizedEntries.map((e) => {
    e.total = e.roster.reduce((acc, cur) => {
      const out = acc + (priceMap[e.contest][cur] ? Number(priceMap[e.contest][cur].projPrice) : 0);
      return out;
    }, e.balance);
    return e;
  });
    // console.log(projTotals);

  const contestSplit = projTotals.reduce((acc, cur) => {
    if (!acc[cur.contest]) { acc[cur.contest] = []; }
    acc[cur.contest].push({ user: cur.username, total: cur.total });
    return acc;
  }, {});
    // console.log(contestSplit);

  contests.forEach((c) => {
    const cleader = contestSplit[c];
    cleader.sort((a, b) => ((a.total < b.total) ? 1 : -1));
    client.set(leaderHashkey(c), JSON.stringify(cleader));
  });
  client2.publish('leaderUpdate', '');
}

setInterval(calculateLeaderboard, 10000);
