import axios from 'axios';

import logger from '../../utilities/logger';
import teams from '../../nflinfo';

import state from './state.nfl';

import setPhase from './phase.nfl';

import NFLGame, { NFLGameCreateType } from '../../features/nflgame/nflgame.model';
import yahooData from '../tests/yahooData';

const teamIDs = Object.values(teams).map((t) => t.id, [] as number[]);
type PhaseMapType = Record<string, string | number>;

// Determine all games and their phases
export async function InitGameState() {
  try {
    const rawGame = await pullGameData();
    const { phasemap, gameobjs } = ParseGameFileInit(rawGame.data);
    await NFLGame.bulkCreate(gameobjs, { ignoreDuplicates: true });
    return await setGamePhases(phasemap);
  } catch (err) {
    logger.error(err);
    return {};
  }
}

// Get game data (from yahoo or mock data)
function pullGameData() {
  if (Number(process.env.YAHOO_MOCK)) {
    return yahooData.games.gamesMonNightMidgame;
  }
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/games.txt');
}

// Parse game info and generate DB records and phase map
export function ParseGameFileInit(data: string) {
  const rawlines = data.split('\n');
  const gamelines = rawlines.filter((l: string) => l[0] === 'g');
  const currentweek = (Number(process.env.WEEK) || 0);

  // Create a map of team IDs and their gamephases
  const phasemaps = gamelines.map(CreatePhaseMap);
  const phasemap: PhaseMapType = Object.assign({}, ...phasemaps);

  // Build up the list of game objects for the DB.
  const gameobjs = gamelines.map((gameline) => {
    const terms = gameline.split('|');
    const awayTeamID = Number(terms[2]);
    const homeTeamID = Number(terms[3]);

    const starttime = Number(terms[10]);

    // Return obj to be used for DB record
    return {
      week: currentweek,
      HomeId: homeTeamID,
      AwayId: awayTeamID,
      startTime: starttime,
    } as NFLGameCreateType;
  });

  if (phasemaps.length < teamIDs.length / 2) {
    // Some teams are on bye. Mark them in pairs with post
    const gameteams = Object.keys(phasemap);
    let remainteams = teamIDs;
    gameteams.forEach((gt) => { remainteams = remainteams.filter((t) => t !== Number(gt)); });
    if (remainteams.length % 2 !== 0) { logger.error(`Odd number of bye week teams? ${gamelines}`); }

    while (remainteams.length > 1) {
      const team1 = remainteams.shift() as number;
      const team2 = remainteams.shift() as number;
      phasemap[team1] = 'post';
      phasemap[team2] = 'post';
      gameobjs.push({
        week: currentweek,
        HomeId: team1,
        AwayId: team2,
        startTime: 2000000000,
      } as NFLGameCreateType);
    }
  }
  return { phasemap, gameobjs };
}

// Create entries in the Phase Map
function CreatePhaseMap(gameline: string) {
  const phasemap: PhaseMapType = {};

  const terms = gameline.split('|');
  const awayTeamID = Number(terms[2]);
  const homeTeamID = Number(terms[3]);

  const gameState = terms[4]; // F finished, P playing, S not started yet
  const starttime = Number(terms[10]);

  switch (gameState) {
    case 'F':
      phasemap[awayTeamID] = 'post';
      phasemap[homeTeamID] = 'post';
      break;
    case 'P':
      phasemap[awayTeamID] = 'mid';
      phasemap[homeTeamID] = 'mid';
      break;
    case 'S':
      if (Date.now() / 1000 > starttime) {
        // For some reason, gamestate hasn't updated but it should have
        phasemap[awayTeamID] = 'mid';
        phasemap[homeTeamID] = 'mid';
      } else {
        phasemap[awayTeamID] = starttime;
        phasemap[homeTeamID] = starttime;
      }
      break;
    default:
      logger.error('Unexpected game state', gameline);
  }
  return phasemap;
}

// Set game phases for each game
// Schedule phase changes
// and update the timeObj
async function setGamePhases(phasemap: PhaseMapType) {
  const phaseTeams = Object.keys(phasemap);
  // Record phase info in DB
  const setPhases = phaseTeams.map((team) => {
    const teamID = Number(team);
    const phase = phasemap[teamID];
    if (typeof phase === 'number') return setPhase(teamID, 'pre');
    return setPhase(teamID, phase);
  });
  await Promise.all(setPhases);

  // Populate timeobj and set up timeouts for "mid" conversions
  phaseTeams.forEach((team) => {
    const teamID = Number(team);
    const phase = phasemap[teamID];
    if (typeof phase === 'number') {
      setTimeout(() => { setPhase(teamID, 'mid'); }, (Number(phase) * 1000 - Date.now()));
    } else if (phase === 'post') {
      state.timeObj[teamID] = 1;
    }
  });
}

// Pull game info and update timefractions
// timefrac is time elapsed / total game time for use in live projections
export async function PullAllGames() {
  try {
    const rawGame = await pullGameData();
    return ParseGameFileUpdate(rawGame.data);
  } catch (err) {
    logger.error(err);
    return [];
  }
}

// Find games that have changed the time elapsed
export function ParseGameFileUpdate(data: string) {
  const rawlines = data.split('\n');
  const gamelines = rawlines.filter((l: string) => l[0] === 'g');
  const changedTeams: number[] = [];
  gamelines.forEach((gameline: string) => {
    const terms = gameline.split('|');
    const team1 = Number(terms[2]);
    const team2 = Number(terms[3]);

    // We've already marked this game as done, so end
    if (state.timeObj[team1] === 1) {
      return;
    }
    // If a game has finished, change the phase
    const gameState = terms[4]; // F finished, P playing, S not started yet
    if (gameState === 'F') {
      state.timeObj[team1] = 1;
      state.timeObj[team2] = 1;
      setPhase(team1, 'post');
      setPhase(team2, 'post');
      return;
    }

    const timefrac = CalculateTimefrac(gameline);

    if (state.timeObj[team1] === undefined || state.timeObj[team1] !== timefrac) {
      state.timeObj[team1] = timefrac;
      changedTeams.push(team1);
    }
    if (state.timeObj[team2] === undefined || state.timeObj[team2] !== timefrac) {
      state.timeObj[team2] = timefrac;
      changedTeams.push(team2);
    }
  });
  return changedTeams;
}

// Calculate time left in the game
export function CalculateTimefrac(gameline: string) {
  const terms = gameline.split('|');

  // Calculate time left in the game
  const quarter = Number(terms[6]);
  const time = terms[7].split(':');
  const isOT = Number(quarter === 5);
  // Calculation should take into account overtime
  const timeElapsed = (
    (quarter - 1) * 15 * 60)
      + ((15 - 5 * isOT) * 60 - Number(time[0]) * 60 + Number(time[1])
      );
  const timefrac = timeElapsed / ((60 * 60) + (10 * 60 * isOT));
  return timefrac;
}
