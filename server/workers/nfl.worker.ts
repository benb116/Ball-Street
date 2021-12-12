import axios from 'axios';
import getNFLPlayers from '../features/nflplayer/services/getNFLPlayers.service';
import { rediskeys, client } from '../db/redis';

import { SumPoints } from './nfl/dict.nfl';
import state from './nfl/state.nfl';
import logger from '../utilities/logger';
import { GameState, PullAllGames, setGamePhases } from './nfl/games.nfl';
import { PullAllStats, UpdateStats } from './nfl/stats.nfl';
import scrape from '../db/playerscraper';
import statUpdate from './live/channels/statUpdate.channel';
import PullLatestInjuries from './nfl/injury.nfl';
import { NFLPlayerType } from '../features/nflplayer/nflplayer.model';

const checkInterval = 10000;

init().then(() => setInterval(repeat, checkInterval));

async function init() {
  // Which team is a player on
  logger.info('Creating playerTeamMap');
  state.playerTeamMap = await createPTMap();
  // If production, pull down players for the week
  if (process.env.NODE_ENV === 'production') {
    logger.info('Scraping player data');
    await scrape().catch(logger.error);
  }
  // What was a player's pre-game projection
  logger.info('Creating preProjMap');
  state.preProjObj = await pullPreProj();
  // What is the state of each game?
  logger.info('Getting gamestates');
  const phasemap = await GameState();
  // What are the latest stats?
  logger.info('Pulling initial stats');
  const newlines = await PullAllStats().then(GetNewStats);
  // Set all game phases and schedule changes
  logger.info('Setting game phases');
  await setGamePhases(phasemap);
  // Pull game time information
  logger.info('Pulling game time info');
  const gamesChanged = await PullAllGames();
  // Calculate latest point values and push
  logger.info('Calculating point values');
  SetValues(CalcValues(newlines, gamesChanged));
  // Pull injury information and send updates
  logger.info('Pull Injury info');
  await PullLatestInjuries();
  logger.info('NFL worker initialized');
}

async function repeat() {
  state.playerTeamMap = await createPTMap().catch(() => state.playerTeamMap || {});
  // Pull game time information
  const gamesChanged = await PullAllGames();
  // Pull stats, find differences, calc and set values
  const statsChanged = await PullAllStats().then(GetNewStats);
  SetValues(CalcValues(statsChanged, gamesChanged));
  // Pull injury information and send updates
  await PullLatestInjuries();
}

// Populate the playerTeamMap
function createPTMap() {
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/players.txt')
    .then((raw) => raw.data.split('\n'))
    .then((rawlines) => rawlines.filter((l: string) => l[0] === 'm'))
    .then((playerlines) => playerlines.reduce((acc: Record<string, number>, line: string) => {
      const terms = line.split('|');
      const playerID = terms[1];
      const teamID = Number(terms[2]);
      acc[playerID] = teamID;
      return acc;
    }, {}));
}

// Populate the preProjMap
function pullPreProj() {
  return getNFLPlayers().then((data) => data.reduce(
    (acc: Record<string, number>, p: NFLPlayerType) => {
      if (p.preprice) acc[p.id] = p.preprice;
      const teamID = p.NFLTeamId;
      if (!state.teamPlayerMap[teamID]) state.teamPlayerMap[teamID] = [];
      state.teamPlayerMap[teamID].push(p.id);
      state.playerTeamMap[p.id] = teamID.toString();
      return acc;
    }, {},
  ));
}

// Find stat changes since last time
function GetNewStats(lines: string[]) {
  const newlines = lines.filter(UpdateStats);
  return newlines;
}

// Calculate new point values (actual and live projection)
function CalcValues(statlines: string[] = [], newteamTimes : number[] = []) {
  const statPlayers = statlines.map((l: string) => Number(l.split('|')[1]));
  const teamPlayers = newteamTimes.map((t) => state.teamPlayerMap[t]).flat();
  const playersToCalc = [statPlayers, teamPlayers].flat();
  return playersToCalc.filter((p) => p).map(CalcPlayer);
}

interface PlayerValType {
  nflplayerID: number,
  statPrice: number,
  projPrice: number,
}
// Calculate statpoints and projpoints for players with changed stats
function CalcPlayer(playerid: number) {
  // Get a player's stat object
  const stats = (state.statObj[playerid] || {});
  // Calculate points
  const statpoints = SumPoints(stats);
  // Estimate projection
  const projpoints = EstimateProjection(playerid, statpoints);
  return {
    nflplayerID: playerid,
    statPrice: Math.round(statpoints),
    projPrice: Math.round(projpoints),
  };
}

// Calculate new live projection for a player
function EstimateProjection(playerid: number, statpoints: number) {
  // Find player's team
  const teamID = (state.playerTeamMap[playerid] || playerid);
  // Find time remaining
  const timefrac = (state.timeObj[teamID] || 0);
  const timeleft = (timefrac === 0 ? 0 : (1 - timefrac));
  // is Defense
  const isDefense = (playerid < 40);
  const dbid = (playerid || 0);

  // Calculate and return
  if (isDefense) {
    return (
      1000
      - ((1000 - (state.preProjObj[dbid] || 0)) * timeleft)
      - (1000 - statpoints)
    );
  }
  return statpoints + timeleft * (state.preProjObj[dbid] || 0);
}

// Set values in redis and publish an update
function SetValues(playerVals: PlayerValType[]) {
  const statvals = playerVals.reduce((acc, cur) => {
    acc.push(cur.nflplayerID.toString(), cur.statPrice.toString());
    return acc;
  }, [] as string[]);
  const projvals = playerVals.reduce((acc, cur) => {
    acc.push(cur.nflplayerID.toString(), cur.projPrice.toString());
    return acc;
  }, [] as string[]);

  const outobj = playerVals.reduce((acc, cur) => {
    acc[cur.nflplayerID] = {
      nflplayerID: cur.nflplayerID,
      statPrice: cur.statPrice,
      projPrice: cur.projPrice,
    };
    return acc;
  }, {} as Record<string, PlayerValType>);

  if (playerVals.length) statUpdate.pub(outobj);
  if (statvals.length) client.HSET(rediskeys.statpriceHash(), statvals);
  if (projvals.length) client.HSET(rediskeys.projpriceHash(), projvals);
}
