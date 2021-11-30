// Set up redis connections and utilities

const { createClient } = require('redis');

const REDIS_HOST = (process.env.REDIS_HOST || 'localhost');
const REDIS_PORT = (process.env.REDIS_PORT || 6379);

const connObj = {
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
  socket: { connectTimeout: 10000 },
};
const client = createClient(connObj);
client.connect();
const subscriber = client.duplicate();

const queueOptions = { redis: { port: REDIS_PORT, host: REDIS_HOST } };

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

module.exports = {
  client,
  subscriber,
  queueOptions,
  rediskeys,
  REDIS_HOST,
  REDIS_PORT,
};
