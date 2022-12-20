// Pull data about players, games, and stats
// Disseminate changes to live servers
// And manage contest entries

import axios from 'axios';

import logger from '../utilities/logger';

import state from './nfl/state.nfl';
import { InitGameState, PullAllGames } from './nfl/games.nfl';
import { CalcValues, GetNewStats, SetValues } from './nfl/stats.nfl';
import scrape from '../db/playerscraper';
import PullLatestInjuries from './nfl/injury.nfl';

import getNFLPlayers from '../features/nflplayer/services/getNFLPlayers.service';

import yahooData from './tests/yahooData';
import { TeamIDType } from '../nflinfo';

const checkInterval = 10000;

init().then(() => setInterval(repeat, checkInterval));

async function init() {
  // Which team is a player on
  logger.info('Creating playerTeamMap');
  state.playerTeamMap = await createPTMap();
  // If production, pull down players for the week
  if (process.env['NODE_ENV'] === 'production' && !Number(process.env['YAHOO_MOCK'])) {
    logger.info('Scraping player data');
    await scrape().catch(logger.error);
  }
  // What was a player's pre-game projection
  logger.info('Creating preProjMap');
  state.preProjObj = await pullPreProj();
  // What is the state of each game?
  // Pull game time information
  logger.info('Getting gamestates and pulling game time info');
  const gamesChanged = InitGameState().then(PullAllGames);
  // What are the latest stats?
  logger.info('Pulling initial stats');
  const newlines = GetNewStats();
  // Calculate latest point values and push
  Promise.all([newlines, gamesChanged]).then(([newout, gameout]) => {
    logger.info('Calculating point values');
    SetValues(CalcValues(newout, gameout));
  });
  // Pull injury information and send updates
  logger.info('Pull Injury info');
  PullLatestInjuries();
  // logger.info('NFL worker initialized');
}

async function repeat() {
  state.playerTeamMap = await createPTMap().catch(() => state.playerTeamMap || {});
  const gamesChanged = PullAllGames();
  // What are the latest stats?
  const newlines = GetNewStats();
  // Calculate latest point values and push
  Promise.all([newlines, gamesChanged]).then(([newout, gameout]) => {
    SetValues(CalcValues(newout, gameout));
  });
  // Pull injury information and send updates
  PullLatestInjuries();
}

/** Populate the playerTeamMap */
async function createPTMap() {
  const raw = await pullPlayerData();
  const rawlines = raw.data.split('\n');
  const playerlines = rawlines.filter((l: string) => l[0] === 'm');
  return playerlines.reduce((acc: Record<string, number>, line: string) => {
    const terms = line.split('|');
    const playerID = terms[1];
    if (!playerID) return acc;
    const teamID = Number(terms[2]) as TeamIDType;
    acc[playerID] = teamID;
    return acc;
  }, {});
}

function pullPlayerData() {
  if (Number(process.env['YAHOO_MOCK'])) {
    return yahooData.players.playersMonNightMid17;
  }
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/players.txt');
}

/** Populate the preProjMap */
function pullPreProj() {
  return getNFLPlayers().then((data) => data.reduce((acc: Record<string, number>, p) => {
    if (p.preprice) acc[p.id] = p.preprice;
    const teamID = p.NFLTeamId;
    if (!state.teamPlayerMap[teamID]) state.teamPlayerMap[teamID] = [];
    state.teamPlayerMap[teamID].push(p.id);
    state.playerTeamMap[p.id] = teamID;
    return acc;
  }, {}));
}
