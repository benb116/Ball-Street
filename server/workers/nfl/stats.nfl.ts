import axios from 'axios';

import logger from '../../utilities/logger';
import { SumPoints, validStatLetters } from './dict.nfl';

import state from './state.nfl';

import statUpdate from '../live/channels/statUpdate.channel';

import { client, rediskeys } from '../../db/redis';

// Get all latest statlines and filter out ones we don't care about
export async function GetNewStats() {
  try {
    const rawLines = await axios.get('https://relay-stream.sports.yahoo.com/nfl/stats.txt')
      .then((raw) => raw.data.split('\n'));
    const statLines = rawLines.filter(StatType);
    return statLines.filter(UpdateStats);
  } catch (error) {
    logger.error(error);
    return [];
  }
}

// Allow a statline if it's one of the valid stat categories
function StatType(line: string) {
  return validStatLetters.indexOf(line[0]) > -1;
}

// Determine if a statline has changed
export function UpdateStats(line: string) {
  const terms = line.split('|');
  const stattype = terms[0];
  const playerid = terms[1];
  terms.shift();
  terms.shift();
  const statline = terms.join('|');

  // Compare old statline to new
  if (!state.statObj[playerid]) state.statObj[playerid] = {};
  const diff = (
    !state.statObj[playerid][stattype]
    || state.statObj[playerid][stattype] !== statline
  );
  state.statObj[playerid][stattype] = statline;
  return diff;
}

// Calculate new point values (actual and live projection)
export function CalcValues(statlines: string[] = [], newteamTimes : number[] = []) {
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
export function EstimateProjection(playerid: number, statpoints: number) {
  // Find player's team
  const teamID = (state.playerTeamMap[playerid] || playerid);
  // Find time remaining
  const timefrac = (state.timeObj[teamID] || 0);
  const timeleft = (1 - timefrac);
  // is Defense
  const isDefense = (playerid < 40);
  const dbid = (playerid || 0);

  // Calculate and return
  if (isDefense) {
    return statpoints - ((1000 - (state.preProjObj[dbid] || 0)) * timeleft);
  }
  return statpoints + timeleft * (state.preProjObj[dbid] || 0);
}

// Set values in redis and publish an update
export function SetValues(playerVals: PlayerValType[]) {
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
