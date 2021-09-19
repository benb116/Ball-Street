const axios = require('axios');
const logger = require('../../utilities/logger');
const dict = require('./dict.nfl');
const setPhase = require('./phase.nfl');
const state = require('./state.nfl');
const { get } = require('../../db/redis');
const { NFLGame } = require('../../models');

// Determine all games and their phases
function GameState() {
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/games.txt')
    .then((raw) => raw.data.split('\n'))
    .then((rawlines) => rawlines.filter((l) => l[0] === 'g'))
    .then(async (gamelines) => {
      const currentweek = (await get.CurrentWeek() || 0);
      const phasemap = {};
      // Build up the list of games for the DB and the phasemap.
      const gameobjs = gamelines.map((gameline) => {
        const terms = gameline.split('|');
        const awayTeamID = dict.teamIDMap[Number(terms[2])];
        const homeTeamID = dict.teamIDMap[Number(terms[3])];

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
        };
      });

      if (gameobjs.length < 16) {
        // Some teams are on bye. Mark them in pairs with post
        const gameteams = Object.keys(phasemap);
        let remainteams = Array(32).fill().map((x, i) => i + 1);
        gameteams.forEach((t) => { remainteams[t] = 0; });
        remainteams = remainteams.filter((t) => t !== 0);
        if (remainteams.length % 2 !== 0) { logger.error(`Odd number of bye week teams? ${gamelines}`); }
        while (remainteams.length > 1) {
          const team1 = remainteams.shift();
          const team2 = remainteams.shift();
          phasemap[team1] = 'post';
          phasemap[team2] = 'post';
          gameobjs.push({
            week: currentweek,
            HomeId: team1,
            AwayId: team2,
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
    });
}

// Given a phasemap, set phases in DB or schedule change
async function setGamePhases(phasemap) {
  const teams = Object.keys(phasemap);
  for (let i = 0; i < teams.length; i++) {
    // Do these in series to avoid overloading DB connections
    const teamID = teams[i];
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
        state.timeObj[teamID] = 'done';
      }
    }
  }
}

// Pull game info and update timefractions
// timefrac is time elapsed / total game time for use in live projections
function PullAllGames() {
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/games.txt')
    .then((raw) => raw.data.split('\n'))
    .then((rawlines) => rawlines.filter((l) => l[0] === 'g'))
    .then((gamelines) => {
      gamelines.forEach(async (gameline) => {
        const terms = gameline.split('|');
        const team1 = dict.teamIDMap[Number(terms[2])];
        const team2 = dict.teamIDMap[Number(terms[3])];

        // We've already marked this game as done, so end
        if (state.timeObj[team1] === 'done') {
          return;
        }
        // If a game has finished, change the phase
        const gameState = terms[4]; // F finished, P playing, S not started yet
        if (gameState === 'F') {
          state.timeObj[team1] = 'done';
          state.timeObj[team2] = 'done';
          await setPhase(team1, 'post');
          await setPhase(team2, 'post');
          return;
        }

        // Calculate time left in the game
        const quarter = Number(terms[6]);
        const time = terms[7].split(':');
        // Calculation should take into account overtime
        const timeElapsed = (
          (quarter - 1) * 15 * 60)
          + ((15 - 5 * (quarter === 5)) * 60 - Number(time[0]) * 60 + Number(time[1])
          );
        const timefrac = timeElapsed / ((60 * 60) + (10 * 60 * (quarter === 5)));
        state.timeObj[team1] = timefrac;
        state.timeObj[team2] = timefrac;
      });
    });
}

module.exports = {
  GameState,
  setGamePhases,
  PullAllGames,
};