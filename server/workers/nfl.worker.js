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
  // Which team is a player on
  logger.info('Creating playerTeamMap');
  state.playerTeamMap = await createPTMap();
  // What was a player's pre-game projection
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
  SetValues(CalcValues(newlines, []));

  logger.info('NFL worker initialized');
}

async function repeat() {
  state.playerTeamMap = await createPTMap().catch(() => state.playerTeamMap || {});
  // Pull game time information
  const gamesChanged = await PullAllGames();
  // Pull stats, find differences, calc and set values
  const statsChanged = await PullAllStats().then(GetNewStats);
  await SetValues(CalcValues(statsChanged, gamesChanged));
}

// Populate the playerTeamMap
function createPTMap() {
  return axios.get('https://relay-stream.sports.yahoo.com/nfl/players.txt')
    .then((raw) => raw.data.split('\n'))
    .then((rawlines) => rawlines.filter((l) => l[0] === 'm'))
    .then((playerlines) => playerlines.reduce((acc, line) => {
      const terms = line.split('|');
      const playerID = terms[1];
      const teamID = Number(terms[2]);
      acc[playerID] = teamID;
      if (!state.teamPlayerMap[teamID]) state.teamPlayerMap[teamID] = [];
      state.teamPlayerMap[teamID].push(playerID);
      return acc;
    }, {}));
}

// Populate the preProjMap
function pullPreProj() {
  return getNFLPlayers().then((data) => data.reduce((acc, p) => {
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
function CalcValues(statlines = [], newteamTimes = []) {
  const statPlayers = statlines.map((l) => l.split('|')[1]);
  const teamPlayers = newteamTimes.map((t) => state.teamPlayerMap[t]).flat();
  const playersToCalc = [statPlayers, teamPlayers].flat();
  return playersToCalc.map(CalcPlayer).filter((e) => e !== false);
}

// Calculate statpoints and projpoints for players with changed stats
function CalcPlayer(playerid) {
  if (!playerid) return false;
  // Get a player's stat object
  const stats = (state.statObj[playerid] || {});
  // Calculate points
  const statpoints = Math.round(100 * (dict.SumPoints(stats)));
  // Estimate projection
  const projpoints = EstimateProjection(playerid, statpoints);
  return [playerid, Math.round(statpoints), Math.round(projpoints)];
}

// Calculate new live projection for a player
function EstimateProjection(playerid, statpoints) {
  // Find player's team
  const teamID = (state.playerTeamMap[playerid] || playerid);
  // Find time remaining
  const timefrac = state.timeObj[teamID];
  const timeleft = (timefrac === 'done' ? 0 : (1 - timefrac));
  // is Defense
  const isDefense = (playerid < 40);
  const dbid = (playerid || 0);
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
