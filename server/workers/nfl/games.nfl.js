const axios = require('axios');
const logger = require('../../utilities/logger');
const dict = require('./dict.nfl');
const setPhase = require('./phase.nfl');
const state = require('./state.nfl');
const { get } = require('../../db/redis');
const { NFLGame } = require('../../models');

// Initialize all game states and schedule changes
function GameState() {
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/games.txt')
    .then((raw) => raw.data.split('\n'))
    .then((rawlines) => rawlines.filter((l) => l[0] === 'g'))
    .then((gamelines) => {
      gamelines.forEach(async (gameline) => {
        const terms = gameline.split('|');
        const awayTeamID = dict.teamIDMap[Number(terms[2])];
        const homeTeamID = dict.teamIDMap[Number(terms[3])];

        const currentweek = await get.CurrentWeek();
        await NFLGame.create({
          week: currentweek,
          HomeId: homeTeamID,
          AwayId: awayTeamID,
        }).catch((err) => {
          if (err?.parent?.constraint !== 'NFLGames_pkey') {
            logger.error(err);
            throw err;
          }
        });

        const gameState = terms[4]; // F finished, P playing, S not started yet
        const starttime = Number(terms[10]);
        switch (gameState) {
          case 'F':
            setPhase(awayTeamID, 'post');
            setPhase(homeTeamID, 'post');
            break;
          case 'P':
            setPhase(awayTeamID, 'mid');
            setPhase(homeTeamID, 'mid');
            break;
          case 'S':
            if (Date.now() > starttime * 1000) {
              // For some reason, gamestate hasn't updated but it should have
              setPhase(awayTeamID, 'mid');
              setPhase(homeTeamID, 'mid');
            } else {
              setPhase(awayTeamID, 'pre');
              setPhase(homeTeamID, 'pre');
              setTimeout(() => {
                setPhase(awayTeamID, 'mid');
                setPhase(homeTeamID, 'mid');
              }, (starttime * 1000 - Date.now()));
              logger.info(`Game scheduled for ${starttime}: ${gameline}`);
            }
            break;
          default:
            logger.error('Unexpected game state', gameline);
        }
      });
    });
}

// Pull game info and update timefractions
// timefrac is time elapsed / total game time for use in live projections
function PullAllGames() {
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/games.txt')
    .then((raw) => raw.data.split('\n'))
    .then((rawlines) => rawlines.filter((l) => l[0] === 'g'))
    .then((gamelines) => {
      gamelines.forEach((gameline) => {
        const terms = gameline.split('|');
        const team1 = Number(terms[2]);
        const team2 = Number(terms[3]);
        const quarter = Number(terms[6]);
        const time = terms[7].split(':');
        const timeElapsed = (
          (quarter - 1) * 15 * 60)
          + ((15 - 5 * (quarter === 5)) * 60 - Number(time[0]) * 60 + Number(time[1])
          );
        const timefrac = timeElapsed / ((60 * 60) + (10 * 60 * (quarter === 5)));
        state.timeObj[team1] = timefrac;
        state.timeObj[team2] = timefrac;

        // If a game has finished, change the phase
        const gameState = terms[4]; // F finished, P playing, S not started yet
        if (gameState === 'F') {
          setPhase(dict.teamIDMap[team1], 'post');
          setPhase(dict.teamIDMap[team2], 'post');
        }
      });
    });
}

module.exports = {
  GameState,
  PullAllGames,
};
