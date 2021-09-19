// Leader worker
// Calculates live leaderboards

const config = require('../config');

const entryService = require('../features/entry/entry.service');

const {
  client, rediskeys, get, set,
} = require('../db/redis');

const { projpriceHash, leaderHash } = rediskeys;

// Pull all latest price info from redis for all players
async function sendLatest() {
  return get.hkeyall(projpriceHash());
}
// Filter out duplicates
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

async function calculateLeaderboard() {
  const rosterPositions = Object.keys(config.Roster);

  // Get all entries across all contests
  const weekentries = await entryService.getWeekEntries();
  // Normalize as objects with balance, roster array, contests and user name
  const normalizedEntries = weekentries.map((e) => {
    const out = {};
    out.balance = e.pointtotal;
    out.roster = rosterPositions.reduce((acc, cur) => {
      if (e[cur]) { acc.push(e[cur]); }
      return acc;
    }, []);
    out.contest = e.ContestId;
    out.username = e.User.name;
    out.userID = e.User.id;
    return out;
  });
  // console.log(normalizedEntries);

  // Get a list of all contests that have entries
  const contests = normalizedEntries.map((e) => e.contest).filter(onlyUnique);

  // Pull latest price info for all contests
  // Build one big price map
  const priceMap = await sendLatest();
  if (!priceMap) return;
  // console.log(priceMap);

  // Sum each entry based on the price map
  const projTotals = normalizedEntries.map((e) => {
    e.total = e.roster.reduce((acc, cur) => {
      if (!priceMap[cur]) {
        return acc;
      }
      // If player has price info, add that, otherwise 0
      const out = acc + (priceMap[cur] ? Number(priceMap[cur]) : 0);
      return out;
    }, e.balance);
    return e;
  });
  // console.log(projTotals);

  // Bin entries in an array for each contest
  const contestSplit = projTotals.reduce((acc, cur) => {
    if (!acc[cur.contest]) { acc[cur.contest] = []; }
    acc[cur.contest].push({ user: cur.username, id: cur.userID, total: cur.total });
    return acc;
  }, {});
  // console.log(contestSplit);

  // For each contest, sort and store
  contests.forEach((c) => {
    const cleader = contestSplit[c];
    cleader.sort((a, b) => ((a.total < b.total) ? 1 : -1));
    set.key(leaderHash(c), JSON.stringify(cleader));
  });

  // Announce new results
  client.publish('leaderUpdate', '');
}

calculateLeaderboard();
setInterval(calculateLeaderboard, 10000);
