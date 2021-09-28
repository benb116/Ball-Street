// Set up redis connections and utilities

const { promisify } = require('util');
const redis = require('redis');
const logger = require('../utilities/logger');

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
const delAsync = promisify(client.del).bind(client);
const hsetAsync = promisify(client.hset).bind(client);
const hgetAsync = promisify(client.hget).bind(client);
const hgetallAsync = promisify(client.hgetall).bind(client);

// Define redis keys for various entries
function leaderHash(contestID) {
  return `contest${contestID}:leaderboard`;
}

function bestbidHash(contestID) {
  return `contest${contestID}:bestbid`;
}

function bestaskHash(contestID) {
  return `contest${contestID}:bestask`;
}

function lasttradeHash(contestID) {
  return `contest${contestID}:lasttrade`;
}

function statpriceHash() {
  return 'stat';
}

function projpriceHash() {
  return 'proj';
}

function gamePhase() {
  return 'gamePhase';
}

function currentWeek() {
  return 'currentWeek';
}

function emailVer(rand) {
  return `emailVer:${rand}`;
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
  logger.error(`Can't set weeknum to ${weeknum}`);
  return Promise.reject();
}

async function initRedisWeek() {
  const theweek = await getCurrentWeek();
  if (!theweek) await setCurrentWeek(1);
}
initRedisWeek();

const rediskeys = {
  bestbidHash,
  bestaskHash,
  lasttradeHash,
  statpriceHash,
  projpriceHash,
  leaderHash,
  gamePhase,
  currentWeek,
  emailVer,
  passReset,
};

const get = {
  CurrentWeek: getCurrentWeek,
  key: getAsync,
  hkey: hgetAsync,
  hkeyall: hgetallAsync,
};

const set = {
  CurrentWeek: setCurrentWeek,
  key: setAsync,
  hkey: hsetAsync,
};

const del = {
  key: delAsync,
};

module.exports = {
  client,
  subscriber,
  queueOptions,
  rediskeys,
  get,
  set,
  del,
};
