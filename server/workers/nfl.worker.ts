import axios from 'axios';
import getNFLPlayers from '../features/nflplayer/services/getNFLPlayers.service';

import state from './nfl/state.nfl';
import logger from '../utilities/logger';
import { InitGameState, PullAllGames } from './nfl/games.nfl';
import { CalcValues, PullAllStats, SetValues } from './nfl/stats.nfl';
import scrape from '../db/playerscraper';
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
  // Pull game time information
  logger.info('Getting gamestates and pulling game time info');
  const gamesChanged = InitGameState().then(PullAllGames);
  // What are the latest stats?
  logger.info('Pulling initial stats');
  const newlines = PullAllStats();
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
  const newlines = PullAllStats();
  // Calculate latest point values and push
  Promise.all([newlines, gamesChanged]).then(([newout, gameout]) => {
    SetValues(CalcValues(newout, gameout));
  });
  // Pull injury information and send updates
  PullLatestInjuries();
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
