// Leader worker
// Calculates live leaderboards

import { RosterPositions, RPosType } from '../config';

import { onlyUnique } from '../features/util/util';

import getNFLPlayers from '../features/nflplayer/services/getNFLPlayers.service';
import getWeekEntries from '../features/entry/services/getWeekEntries.service';

import leaderUpdate from './live/channels/leaderUpdate.channel';

import NFLGame from '../features/nflgame/nflgame.model';
import Entry from '../features/entry/entry.model';
import leader from '../db/redis/leaderboard.redis';
import projprice from '../db/redis/projprice.redis';

// Get player preprice info (used for players without stat info)
interface PlayerMapItem {
  pre: number | null,
  post: number | null,
  team: number
}
let playerMap: Record<string, PlayerMapItem>;
// Get game phase information
let gamePhase: Record<string, string>;
// State determining whether to check for point changes
// No reason to check when no games are going on
let phaseHold = false;

// Populate price and team info for all players
(async () => {
  const playerlist = await getNFLPlayers();
  playerMap = playerlist.reduce((acc: Record<string, PlayerMapItem>, cur) => {
    acc[cur.id] = {
      pre: cur.preprice,
      post: cur.postprice,
      team: cur.NFLTeamId,
    };
    return acc;
  }, {});
})();

async function calculateLeaderboard() {
  // Get current game phases (used to determine which point value to use)
  const gamelist = await NFLGame.findAll({ where: { week: Number(process.env.WEEK) } });
  // Are all games in pre or post phase
  interface GameItem {
    phase: string,
    HomeId: number,
    AwayId: number,
  }
  const newphaseHold = gamelist.reduce(
    (acc: boolean, cur: GameItem) => (acc && (cur.phase !== 'mid')),
    true,
  );
  // If yes, do one more calc then hold;
  if (phaseHold && newphaseHold) return;
  phaseHold = newphaseHold;

  interface PhaseMap {
    [key: string]: string,
  }
  // Which phase is a given team in
  gamePhase = gamelist.reduce((acc: PhaseMap, cur: GameItem) => {
    acc[cur.HomeId] = cur.phase;
    acc[cur.AwayId] = cur.phase;
    return acc;
  }, {});

  // Get all entries across all contests
  const weekentries = await getWeekEntries();

  interface EntryWithTotal {
    balance: number,
    roster: number[],
    contest: number,
    username: string,
    userID: number,
    total: number,
  }

  // Normalize as objects with balance, roster array, contests and user name
  const normalizedEntries: EntryWithTotal[] = weekentries.map((e: Entry) => ({
    balance: e.pointtotal,
    roster: RosterPositions.reduce((acc: number[], cur: RPosType) => {
      const thePlayer = e[cur];
      if (!thePlayer) return acc;
      acc.push(thePlayer);
      return acc;
    }, []),
    contest: e.ContestId,
    username: (e.User ? e.User.name : ''),
    userID: (e.User ? e.User.id : 0),
    total: 0,
  }));
  // console.log(normalizedEntries);

  // Get a list of all contests that have entries
  const contests = normalizedEntries.map((e) => e.contest).filter(onlyUnique).map(Number);

  // Pull latest price info for all contests
  // Build one big price map
  const priceMap = await projprice.getall();
  if (!priceMap) return;
  // console.log(priceMap);

  // Sum each entry based on the price map
  const projTotals: EntryWithTotal[] = normalizedEntries.map((e) => {
    const total = e.roster.reduce((acc: number, cur: number) => {
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
    return { ...e, total };
  });
  // console.log(projTotals);

  interface LeaderItemType {
    user: string,
    id: number,
    total: number,
  }
  // Bin entries in an array for each contest
  const contestSplit = projTotals.reduce((acc: Record<string, LeaderItemType[]>, cur) => {
    if (!acc[cur.contest]) { acc[cur.contest] = []; }
    acc[cur.contest].push({ user: cur.username, id: cur.userID, total: cur.total });
    return acc;
  }, {});
  // console.log(contestSplit);

  // For each contest, sort and store
  contests.forEach((c: number) => {
    const cleader = contestSplit[c];
    cleader.sort((a:LeaderItemType, b:LeaderItemType) => ((a.total < b.total) ? 1 : -1));
    leader.set(c, cleader);
  });

  // Announce new results
  leaderUpdate.pub();
}

calculateLeaderboard();
setInterval(calculateLeaderboard, 10000);
