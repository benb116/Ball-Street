import axios from 'axios';

import logger from '../../utilities/logger';
import { SumPoints, validStatLetters } from './dict.nfl';

import state from './state.nfl';

import statUpdate from '../live/channels/statUpdate.channel';

import yahooData from '../tests/yahooData';
import statprice from '../../db/redis/statprice.redis';
import projprice from '../../db/redis/projprice.redis';
import { teamIDs, TeamIDType } from '../../../types/nflinfo';

// Get all latest statlines and filter out ones we don't care about
export async function GetNewStats() {
  try {
    const statData = await pullStatData();
    const rawLines = statData.data.split('\n');
    const statLines = rawLines.filter(StatType);
    return statLines.filter(UpdateStats);
  } catch (error) {
    logger.error(error);
    return [];
  }
}

function pullStatData() {
  if (Number(process.env['YAHOO_MOCK'])) {
    return yahooData.stats.statsMonNightMidgame;
  }
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/stats.txt');
}

/** Allow a statline if it's one of the valid stat categories */
function StatType(line: string) {
  const statLetter = line[0];
  if (!statLetter) return false;
  return validStatLetters.indexOf(statLetter) > -1;
}

/** Determine if a statline has changed */
export function UpdateStats(line: string) {
  const terms = line.split('|');
  const stattype = terms[0];
  const playerid = terms[1];
  if (!playerid || !stattype) return false;
  terms.shift();
  terms.shift();
  const statline = terms.join('|');

  // Compare old statline to new
  if (!state.statObj[playerid]) state.statObj[playerid] = {};
  const playerStats = state.statObj[playerid];
  if (!playerStats) return false;
  const diff = (!playerStats[stattype] || playerStats[stattype] !== statline);
  playerStats[stattype] = statline;
  return diff;
}

/** Calculate new point values (actual and live projection) */
export function CalcValues(statlines: string[] = [], newteamTimes : TeamIDType[] = []) {
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
/** Calculate statpoints and projpoints for players with changed stats */
function CalcPlayer(playerid: number) {
  // Get a player's stat object
  const stats = (state.statObj[playerid] || {});
  // Calculate points
  const statpoints = SumPoints(stats);
  // Estimate projection
  let projpoints = EstimateProjection(playerid, statpoints);
  if (!projpoints) projpoints = statpoints;
  return {
    nflplayerID: playerid,
    statPrice: Math.round(statpoints),
    projPrice: Math.round(projpoints),
  };
}

/** Calculate new live projection for a player */
export function EstimateProjection(playerid: number, statpoints: number) {
  // Find player's team
  let teamID = state.playerTeamMap[playerid];
  if (teamIDs.includes(playerid as TeamIDType)) teamID = playerid as TeamIDType;
  if (!teamID) return null;
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

/** Set values in redis and publish an update */
export function SetValues(playerVals: PlayerValType[]) {
  const outobj = playerVals.reduce((acc, cur) => {
    acc[cur.nflplayerID] = {
      nflplayerID: cur.nflplayerID,
      statPrice: cur.statPrice,
      projPrice: cur.projPrice,
    };
    return acc;
  }, {} as Record<string, PlayerValType>);

  statprice.set(playerVals);
  projprice.set(playerVals);
  if (playerVals.length) statUpdate.pub(outobj);
}
