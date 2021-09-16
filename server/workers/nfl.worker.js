const axios = require('axios');
const getNFLPlayers = require('../features/nflplayer/services/getNFLPlayers.service');
const { rediskeys, set, client } = require('../db/redis');

const dict = require('./stats/dict.nfl');
const state = require('./stats/state.nfl');
const logger = require('../utilities/logger');
const setPhase = require('./stats/phase.nfl');

init().then(repeat).then(() => setInterval(repeat, 10000));

async function init() {
  state.playerTeamMap = await createPTMap();
  state.preProjObj = await pullPreProj();
  await GameState();
}

function repeat() {
  return PullAllGames().then(PullAllStats).then(GetNewStats).then(CalcValues)
    .then(SetValues);
}

// Initialize all game states and schedule changes
function GameState() {
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/games.txt')
    .then((raw) => raw.data.split('\n'))
    .then((rawlines) => rawlines.filter((l) => l[0] === 'g'))
    .then((gamelines) => {
      gamelines.forEach((gameline) => {
        const terms = gameline.split('|');
        const team1 = dict.teamIDMap[Number(terms[2])];
        const team2 = dict.teamIDMap[Number(terms[3])];
        const gameState = terms[4]; // F finished, P playing, S not started yet
        const starttime = Number(terms[10]);
        switch (gameState) {
          case 'F':
            setPhase(team1, 'post');
            setPhase(team2, 'post');
            logger.info(`Game set as post: ${gameline}`);
            break;
          case 'P':
            setPhase(team1, 'mid');
            setPhase(team2, 'mid');
            logger.info(`Game set as mid: ${gameline}`);
            break;
          case 'S':
            if (Date.now() > starttime * 1000) {
              // For some reason, gamestate hasn't updated but it should have
              setPhase(team1, 'mid');
              setPhase(team2, 'mid');
              logger.info(`Game set as mid: ${gameline}`);
            } else {
              setPhase(team1, 'pre');
              setPhase(team2, 'pre');
              setTimeout(() => {
                setPhase(team1, 'mid');
                setPhase(team2, 'mid');
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

// Populate the playerTeamMap and the playerIDMap
function createPTMap() {
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/players.txt')
    .then((raw) => raw.data.split('\n'))
    .then((rawlines) => rawlines.filter((l) => l[0] === 'm'))
    .then((playerlines) => playerlines.reduce((acc, line) => {
      const terms = line.split('|');
      const playerID = terms[1];
      const teamID = Number(terms[2]);
      const name = `${terms[4]} ${terms[5]}`;
      state.playerIDMap[playerID] = name;
      acc[playerID] = teamID;
      return acc;
    }, {}));
}

// Populate the preProjMap and the IDPlayerMap
function pullPreProj() {
  return getNFLPlayers().then((data) => data.reduce((acc, p) => {
    state.IDPlayerMap[p.name] = p.id;
    acc[p.id] = p.preprice;
    return acc;
  }, {}));
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

// Get all latest statlines and filter out ones we don't care about
function PullAllStats() {
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/stats.txt')
    .then((raw) => raw.data.split('\n'))
    .then((lines) => lines.filter(StatType));
}

// Allow a statline if it's one of the valid stat categories
function StatType(line) {
  return (dict.validStatLetters.indexOf(line[0]) > -1) ? line[0] : false;
}

// Find stat changes since last time
function GetNewStats(lines) {
  const newlines = lines.filter(UpdateStats);
  return newlines;
}

// Determine if a statline has changed
function UpdateStats(line) {
  const terms = line.split('|');
  const stattype = terms[0];
  const playerid = terms[1];
  terms.shift();
  terms.shift();
  const statline = terms.join('|');
  if (!state.statObj[playerid]) state.statObj[playerid] = {};
  const diff = (
    !state.statObj[playerid][stattype]
    || state.statObj[playerid][stattype] !== statline
  );
  state.statObj[playerid][stattype] = statline;
  return diff;
}

// Calculate new point values (actual and live projection)
function CalcValues(statlines) {
  let playersToCalc = statlines.map((l) => l.split('|')[1]);
  if (!playersToCalc) { playersToCalc = Object.keys(state.statObj); }
  return playersToCalc.map(CalcPlayer).filter((e) => e !== false);
}

// Calculate statpoints and projpoints for players with changed stats
function CalcPlayer(playerid) {
  const stats = state.statObj[playerid];
  const statpoints = Math.round(100 * (dict.SumPoints(stats)));
  const projpoints = EstimateProjection(playerid, statpoints);
  const dbid = (state.IDPlayerMap[state.playerIDMap[playerid]] || state.teamIDMap[playerid] || 0);
  if (!dbid) return false;
  return [dbid, Math.round(statpoints), Math.round(projpoints)];
}

// Calculate new live projection for a player
function EstimateProjection(playerid, statpoints) {
  // Find player's team
  const teamID = (state.playerTeamMap[playerid] || playerid);
  // Find time remaining
  const timefrac = state.timeObj[teamID];
  // is Defense
  const isDefense = (playerid < 40);
  const dbid = (state.IDPlayerMap[state.playerIDMap[playerid]] || state.teamIDMap[playerid] || 0);
  // Calculate and return
  return statpoints + (1 - timefrac) * (state.preProjObj[dbid] || 0) * (1 - 2 * isDefense);
}

// Set values in redis and publish an update
function SetValues(playerVals) {
  const allPromises = playerVals.map((pv) => {
    logger.info(pv);
    client.publish('statUpdate', JSON.stringify({
      nflplayerID: pv[0],
      statPrice: Number(pv[1]),
      projPrice: Number(pv[2]),
    }));
    return set.hkey(
      rediskeys.statHash(pv[0]),
      'statPrice', pv[1],
      'projPrice', pv[2],
    );
  });
  return Promise.all(allPromises);
}
