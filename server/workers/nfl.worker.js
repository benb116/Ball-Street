const axios = require('axios');
const getNFLPlayers = require('../features/nflplayer/services/getNFLPlayers.service');
const { rediskeys, set } = require('../db/redis');

const dict = require('./nfl/dict.nfl');
const state = require('./nfl/state.nfl');
const logger = require('../utilities/logger');
const { GameState, PullAllGames, setGamePhases } = require('./nfl/games.nfl');
const { PullAllStats, UpdateStats } = require('./nfl/stats.nfl');
const scrape = require('../db/playerscraper');
const statUpdate = require('./live/channels/statUpdate.channel');
const PullLatestInjuries = require('./nfl/injury.nfl');

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
  const gamesChanged = await PullAllGames();
  // Calculate latest point values and push
  logger.info('Calculating point values');
  SetValues(CalcValues(newlines, gamesChanged));

  logger.info('NFL worker initialized');
}

async function repeat() {
  state.playerTeamMap = await createPTMap().catch(() => state.playerTeamMap || {});
  // Pull game time information
  const gamesChanged = await PullAllGames();
  // Pull stats, find differences, calc and set values
  const statsChanged = await PullAllStats().then(GetNewStats);
  SetValues(CalcValues(statsChanged, gamesChanged));
  // Pull injury information and send updates
  await PullLatestInjuries();
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
      return acc;
    }, {}));
}

// Populate the preProjMap
function pullPreProj() {
  return getNFLPlayers().then((data) => data.reduce((acc, p) => {
    acc[p.id] = p.preprice;
    const teamID = p.NFLTeamId;
    if (!state.teamPlayerMap[teamID]) state.teamPlayerMap[teamID] = [];
    state.teamPlayerMap[teamID].push(p.id);
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
  const statpoints = dict.SumPoints(stats);
  // Estimate projection
  const projpoints = EstimateProjection(playerid, statpoints);
  return [playerid, Math.round(statpoints), Math.round(projpoints)];
}

// Calculate new live projection for a player
function EstimateProjection(playerid, statpoints) {
  // Find player's team
  const teamID = (state.playerTeamMap[playerid] || playerid);
  // Find time remaining
  const timefrac = (state.timeObj[teamID] || 0);
  const timeleft = (timefrac === 'done' ? 0 : (1 - timefrac));
  // is Defense
  const isDefense = (playerid < 40);
  const dbid = (playerid || 0);

  // Calculate and return
  if (isDefense) {
    return (
      1000
      - ((1000 - (state.preProjObj[dbid] || 0)) * timeleft)
      - (1000 - statpoints)
    );
  }
  return statpoints + timeleft * (state.preProjObj[dbid] || 0);
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

  if (playerVals.length) statUpdate.pub(outobj);
  if (statvals.length) set.hkey([rediskeys.statpriceHash(), ...statvals]);
  if (projvals.length) set.hkey([rediskeys.projpriceHash(), ...projvals]);
}
