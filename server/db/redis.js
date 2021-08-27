// Set up redis connections and utilities

const { promisify } = require('util');
const redis = require('redis');

const REDIS_HOST = (process.env.REDIS_HOST || 'localhost');
const REDIS_PORT = (process.env.REDIS_PORT || 6379);

// Used for all commands and publishing
const client = (function createClient() {
  return redis.createClient(
    REDIS_PORT,
    REDIS_HOST,
  );
}());

// Used for subscribing (must be separate client)
const subscriber = (function createClient() {
  return redis.createClient(
    REDIS_PORT,
    REDIS_HOST,
  );
}());

const queueOptions = { redis: { port: REDIS_PORT, host: REDIS_HOST } };

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const hsetAsync = promisify(client.hset).bind(client);

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

function passReset(rand) {
  return `passReset:${rand}`;
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

async function initRedisWeek() {
  const theweek = await getCurrentWeek();
  if (!theweek) await setCurrentWeek(1);
}
initRedisWeek();

const rediskeys = {
  hash,
  leaderHash,
  statHash,
  gamePhase,
  currentWeek,
  passReset,
};

const get = {
  CurrentWeek: getCurrentWeek,
  key: getAsync,
};

const set = {
  CurrentWeek: setCurrentWeek,
  key: setAsync,
  hkey: hsetAsync,
};

module.exports = {
  client,
  subscriber,
  queueOptions,
  rediskeys,
  get,
  set,
};
