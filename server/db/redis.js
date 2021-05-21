// Set up redis connections and utilities

const { promisify } = require('util');
const redis = require('redis');

// Used for all commands and publishing
const client = (function createClient() {
  return redis.createClient();
}());

// Used for subscribing (must be separate client)
const subscriber = (function createClient() {
  return redis.createClient();
}());

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

// Define redis keys for various entries
function hash(contestID, nflplayerID) {
  return `contest${contestID}:` + `player${nflplayerID}`;
}

function leaderHash(contestID) {
  return `contest${contestID}:leaderboard`;
}

function gamePhase() {
  return 'gamePhase';
}

function currentWeek() {
  return 'currentWeek';
}

// Functions for setting or getting config values
async function getGamePhase() {
  return getAsync(gamePhase());
}

async function getCurrentWeek() {
  return getAsync(currentWeek()).then(Number);
}

async function setGamePhase(str) {
  if (['pre', 'mid', 'post'].includes(str)) {
    return setAsync(gamePhase(), str);
  }
  // eslint-disable-next-line no-console
  console.log(`Can't set game phase to ${str}`);
  return Promise.reject();
}

async function setCurrentWeek(weeknum) {
  if (Number.isInteger(weeknum)) {
    return setAsync(currentWeek(), weeknum.toString());
  }
  // eslint-disable-next-line no-console
  console.log(`Can't set weeknum to ${weeknum}`);
  return Promise.reject();
}

const rediskeys = {
  hash,
  leaderHash,
  gamePhase,
  currentWeek,
};

const get = {
  GamePhase: getGamePhase,
  CurrentWeek: getCurrentWeek,
};

const set = {
  GamePhase: setGamePhase,
  CurrentWeek: setCurrentWeek,
};

module.exports = {
  client,
  subscriber,
  rediskeys,
  get,
  set,
};
