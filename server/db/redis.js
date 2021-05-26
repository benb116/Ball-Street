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

function statHash(nflplayerID) {
  return `${nflplayerID}:stat`;
}

function gamePhase() {
  return 'gamePhase';
}

function currentWeek() {
  return 'currentWeek';
}

// Functions for setting or getting config values
async function getCurrentWeek() {
  return getAsync(currentWeek()).then(Number);
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
  statHash,
  gamePhase,
  currentWeek,
};

const get = {
  CurrentWeek: getCurrentWeek,
};

const set = {
  CurrentWeek: setCurrentWeek,
};

module.exports = {
  client,
  subscriber,
  rediskeys,
  get,
  set,
};
