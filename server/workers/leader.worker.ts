// Leader worker
// Calculates live leaderboards

import config from '../config'
import { dv } from '../features/util/util'

import { rediskeys, client } from '../db/redis'
import getNFLPlayers from '../features/nflplayer/services/getNFLPlayers.service'
import getWeekEntries from '../features/entry/services/getWeekEntries.service'
import { NFLGame } from '../models'
import leaderUpdate from './live/channels/leaderUpdate.channel'

const { projpriceHash, leaderHash } = rediskeys;
const rosterPositions = Object.keys(config.Roster);

// Filter out duplicates
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

// Get player preprice info (used for players without stat info)
let playerMap;
// Get game phase information
let gamePhase;
// State determining whether to check for point changes
// No reason to check when no games are going on
let phaseHold = false;

// Populate price and team info for all players
(async () => {
  const playerlist = await getNFLPlayers();
  playerMap = playerlist.reduce((acc, cur) => {
    if (!acc[cur.id]) acc[cur.id] = {};
    acc[cur.id].pre = cur.preprice;
    acc[cur.id].post = cur.postprice;
    acc[cur.id].team = cur.NFLTeamId;
    return acc;
  }, {});
})();

async function calculateLeaderboard() {
  // Get current game phases (used to determine which point value to use)
  const gamelist = await NFLGame.findAll({ where: { week: Number(process.env.WEEK) } }).then(dv);
  // Are all games in pre or post phase
  const newphaseHold = gamelist.reduce((acc, cur) => (acc && cur.phase !== 'mid'), true);
  // If yes, do one more calc then hold;
  if (phaseHold && newphaseHold) return;
  phaseHold = newphaseHold;

  // Which phase is a given team in
  gamePhase = gamelist.reduce((acc, cur) => {
    acc[cur.HomeId] = cur.phase;
    acc[cur.AwayId] = cur.phase;
    return acc;
  }, {});

  // Get all entries across all contests
  const weekentries = await getWeekEntries();
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
  const priceMap = await client.HGETALL(projpriceHash());
  if (!priceMap) return;
  // console.log(priceMap);

  // Sum each entry based on the price map
  const projTotals = normalizedEntries.map((e) => {
    e.total = e.roster.reduce((acc, cur) => {
      const playerPhase = gamePhase[playerMap[cur].team];
      switch (playerPhase) {
        case 'pre': // preprice
          return acc + (playerMap[cur].pre || 0);
        case 'mid': // projprice
          return acc + (Number(priceMap[cur]) || 0);
        case 'post': // projprice or postprice
          return acc + (Number(priceMap[cur]) || playerMap[cur].post || 0);
        default:
          return acc;
      }
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
    client.SET(leaderHash(c), JSON.stringify(cleader));
  });

  // Announce new results
  leaderUpdate.pub();
}

calculateLeaderboard();
setInterval(calculateLeaderboard, 10000);
