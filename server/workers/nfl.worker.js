const axios = require('axios');
const getNFLPlayers = require('../features/nflplayer/services/getNFLPlayers.service');
const { rediskeys, set, client } = require('../db/redis');

const dict = require('./nfl/dict.nfl');
const state = require('./nfl/state.nfl');
const logger = require('../utilities/logger');
const { GameState, PullAllGames, setGamePhases } = require('./nfl/games.nfl');
const { PullAllStats, UpdateStats } = require('./nfl/stats.nfl');

const checkInterval = 10000;

init().then(() => setInterval(repeat, checkInterval));

async function init() {
  // Which team is a player on, and YahooID -> name
  logger.info('Creating playerTeamMap and playerIDMap');
  state.playerTeamMap = await createPTMap();
  // What was a player's pre-game projection, and name -> BSID
  logger.info('Creating preProjMap');
  state.preProjObj = await pullPreProj();
  // What is the state of each game?
  logger.info('Getting gamestates');
  const phasemap = await GameState();
  // What are the latest stats?
  logger.info('Pulling initial stats');
  const newlines = await PullAllStats().then(GetNewStats);
  // Set all game phases and schedule changes
  logger.info('Setting game phases');
  await setGamePhases(phasemap);
  // Pull game time information
  logger.info('Pulling game time info');
  await PullAllGames();
  // Calculate latest point values and push
  logger.info('Calculating point values');
  SetValues(CalcValues(newlines));

  logger.info('NFL worker initialized');
}

async function repeat() {
  // Pull game time information
  await PullAllGames();
  // Pull stats, find differences, calc and set values
  await PullAllStats().then(GetNewStats).then(CalcValues).then(SetValues);
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
  const playersToCalc = statlines.map((l) => l.split('|')[1]);
  return playersToCalc.map(CalcPlayer).filter((e) => e !== false);
}

// Calculate statpoints and projpoints for players with changed stats
function CalcPlayer(playerid) {
  const dbid = dict.YahootoBSID(playerid, state);
  if (!dbid) return false;
  // Get a player's stat object
  const stats = state.statObj[dbid];
  // Calculate points
  const statpoints = Math.round(100 * (dict.SumPoints(stats)));
  // Estimate projection (requires YahooID)
  const projpoints = EstimateProjection(playerid, statpoints);
  return [dbid, Math.round(statpoints), Math.round(projpoints)];
}

// Calculate new live projection for a player
function EstimateProjection(playerid, statpoints) {
  // Find player's team
  const teamID = (state.playerTeamMap[playerid] || playerid);
  // Find time remaining
  const timefrac = state.timeObj[dict.teamIDMap[teamID]];
  const timeleft = (timefrac === 'done' ? 0 : (1 - timefrac));
  // is Defense
  const isDefense = (playerid < 40);
  const dbid = (state.IDPlayerMap[state.playerIDMap[playerid]] || dict.teamIDMap[playerid] || 0);
  // Calculate and return
  return statpoints + timeleft * (state.preProjObj[dbid] || 0) * (1 - 2 * isDefense);
}

// Set values in redis and publish an update
function SetValues(playerVals) {
  const statvals = playerVals.reduce((acc, cur) => {
    acc.push(cur[0], cur[1]);
    return acc;
  }, []);
  const projvals = playerVals.reduce((acc, cur) => {
    acc.push(cur[0], cur[2]);
    return acc;
  }, []);

  const outobj = playerVals.reduce((acc, cur) => {
    acc[cur[0]] = {
      nflplayerID: cur[0],
      statPrice: Number(cur[1]),
      projPrice: Number(cur[2]),
    };
    return acc;
  }, {});
  if (playerVals.length) client.publish('statUpdate', JSON.stringify(outobj));

  if (statvals.length) set.hkey([rediskeys.statpriceHash(), ...statvals]);
  if (projvals.length) set.hkey([rediskeys.projpriceHash(), ...projvals]);
}
