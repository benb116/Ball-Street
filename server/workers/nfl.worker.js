const axios = require('axios');
const getNFLPlayers = require('../features/nflplayer/services/getNFLPlayers.service');
const { rediskeys, set, client } = require('../db/redis');

const dict = require('./nfl/dict.nfl');
const state = require('./nfl/state.nfl');
const logger = require('../utilities/logger');
const { GameState, PullAllGames } = require('./nfl/games.nfl');
const { PullAllStats, UpdateStats } = require('./nfl/stats.nfl');

init().then(repeat).then(() => setInterval(repeat, 10000));

async function init() {
  state.playerTeamMap = await createPTMap();
  state.preProjObj = await pullPreProj();
  await GameState();
  logger.info('NFL worker initialized');
}

function repeat() {
  return PullAllGames().then(PullAllStats).then(GetNewStats).then(CalcValues)
    .then(SetValues);
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

// Find stat changes since last time
function GetNewStats(lines) {
  const newlines = lines.filter(UpdateStats);
  return newlines;
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
