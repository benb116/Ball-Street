const { promisify } = require('util');
const redis = require('redis');

const client = (function createClient() {
  return redis.createClient();
}());

const subscriber = (function createClient() {
  return redis.createClient();
}());

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

// Common functions for dealing with redis

function hash(contestID, nflplayerID) {
  return `contest${contestID}:` + `player${nflplayerID}`;
}

function leaderHash(contestID) {
  return `contest${contestID}:leaderboard`;
}

function gamePhase() {
  return 'gamePhase'; // "pre", "mid", "post"
}

function currentWeek() {
  return 'currentWeek';
}

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
