import axios from 'axios';
import logger from '../../utilities/logger';
import setPhase from './phase.nfl';
import state from './state.nfl';
import { NFLGame } from '../../models';
import teams from '../../nflinfo';

const teamIDs = Object.values(teams).map((t) => t.id, [] as number[]);

// Determine all games and their phases
export function GameState() {
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/games.txt')
    .then((raw) => raw.data.split('\n'))
    .then((rawlines) => rawlines.filter((l: string) => l[0] === 'g'))
    .then(async (gamelines) => {
      const currentweek = (Number(process.env.WEEK) || 0);
      const phasemap: Record<string, string | number> = {};

      // Build up the list of games for the DB and the phasemap.
      const gameobjs = gamelines.map((gameline: string) => {
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
            if (Date.now() > starttime * 1000) {
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
            return {};
        }

        return {
          week: currentweek,
          HomeId: homeTeamID,
          AwayId: awayTeamID,
          startTime: starttime,
        };
      });

      if (gameobjs.length < 16) {
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
          });
        }
      }

      // Add games to DB (phases changed later)
      await NFLGame.bulkCreate(gameobjs)
        .catch((err) => {
          // If game already exists, ignore an error
          // options.ignoreDuplicates?
          if (err?.parent?.constraint !== 'NFLGames_pkey') {
            logger.error(err);
            throw err;
          }
        });
      return phasemap;
    })
    .catch(logger.error);
}

// Given a phasemap, set phases in DB or schedule change
export async function setGamePhases(phasemap: Record<string, string | number>) {
  const phaseTeams = Object.keys(phasemap);
  for (let i = 0; i < phaseTeams.length; i++) {
    // Do these in series to avoid overloading DB connections
    const teamID = Number(phaseTeams[i]);
    const phase = phasemap[teamID];
    // If we set a timestamp as the phase, delay until that time to set mid
    if (Number.isInteger(phase)) {
      setTimeout(() => {
        setPhase(teamID, 'mid');
      }, (phase * 1000 - Date.now()));
      // eslint-disable-next-line no-await-in-loop
      await setPhase(teamID, 'pre');
      logger.info(`Team ${teamID} game scheduled for ${phase}`);
    } else {
      // eslint-disable-next-line no-await-in-loop
      await setPhase(teamID, phase);
      if (phase === 'post') {
        // Mark that the time is done so PullAllGames doesn't try to do this again
        state.timeObj[teamID] = 0;
      }
    }
  }
}

// Pull game info and update timefractions
// timefrac is time elapsed / total game time for use in live projections
export function PullAllGames() {
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/games.txt')
    .then((raw) => raw.data.split('\n'))
    .then((rawlines) => rawlines.filter((l: string) => l[0] === 'g'))
    .then((gamelines) => {
      const changedTimes: number[] = [];
      gamelines.forEach(async (gameline: string) => {
        const terms = gameline.split('|');
        const team1 = Number(terms[2]);
        const team2 = Number(terms[3]);

        // We've already marked this game as done, so end
        if (state.timeObj[team1] === 0) {
          return;
        }
        // If a game has finished, change the phase
        const gameState = terms[4]; // F finished, P playing, S not started yet
        if (gameState === 'F') {
          state.timeObj[team1] = 0;
          state.timeObj[team2] = 0;
          await setPhase(team1, 'post');
          await setPhase(team2, 'post');
          return;
        }

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
        if (state.timeObj[team1] === undefined || state.timeObj[team1] !== timefrac) {
          state.timeObj[team1] = timefrac;
          changedTimes.push(team1);
        }
        if (state.timeObj[team2] === undefined || state.timeObj[team2] !== timefrac) {
          state.timeObj[team2] = timefrac;
          changedTimes.push(team2);
        }
      });
      return changedTimes;
    })
    .catch((err) => {
      logger.error(err);
      return [];
    });
}
