// Leader worker
// Calculates live leaderboards

const { promisify } = require('util');

const config = require('../config');

const entryService = require('../features/entry/entry.service');
const playerService = require('../features/nflplayer/nflplayer.service');

const { client, rediskeys } = require('../db/redis');

const { statHash, leaderHash } = rediskeys;
const hgetallAsync = promisify(client.hgetall).bind(client);

// Get a list of all player IDs
let playerIDs = [];
(async () => {
  const out = await playerService.getNFLPlayers();
  playerIDs = out.map((p) => p.id);
})();

// Pull all latest price info from redis for all players
async function sendLatest() {
  const outPromises = playerIDs.map((p) => {
    const rkey = statHash(p); // Get the hash key for a player

    return hgetallAsync(rkey).then((obj) => { // Get all price info into price obj
      const out = (obj || {});
      out.nflplayerID = p;
      return out;
    });
  });
  return Promise.all(outPromises);
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
  const priceMap = await sendLatest()
    .then((arr) => {
    // Make a subobject for each contest
      const pMap = arr // For each priceobj in a contest
        // .filter((e) => e !== null) // Get rid of nulls
        .reduce((accpMap, priceObj) => { // Populate the subobject by nflplayerID
          const out2 = accpMap;
          out2[priceObj.nflplayerID] = priceObj;
          return out2;
        }, {});
      return pMap;
    }, {});
  // console.log(priceMap);

  // Sum each entry based on the price map
  const projTotals = normalizedEntries.map((e) => {
    e.total = e.roster.reduce((acc, cur) => {
      if (!priceMap[cur]) {
        return acc;
      }
      // If player has price info, add that, otherwise 0
      const out = acc + (priceMap[cur].projPrice ? Number(priceMap[cur].projPrice) : 0);
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
    client.set(leaderHash(c), JSON.stringify(cleader));
  });

  // Announce new results
  client.publish('leaderUpdate', '');
}

calculateLeaderboard();
setInterval(calculateLeaderboard, 10000);
