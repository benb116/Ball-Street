// Set up redis connections and utilities

import { createClient } from 'redis';

export const REDIS_HOST = (process.env.REDIS_HOST || 'localhost');
export const REDIS_PORT = (Number(process.env.REDIS_PORT) || 6379);

const connObj = {
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
  socket: { connectTimeout: 15000 },
};
export const client = createClient(connObj);
client.connect();
export const subscriber = client.duplicate();

export const queueOptions = { redis: { port: REDIS_PORT, host: REDIS_HOST } };

// Define redis keys for various entries
function leaderHash(contestID: number) {
  return `contest${contestID}:leaderboard`;
}

function bestbidHash(contestID: number) {
  return `contest${contestID}:bestbid`;
}

function bestaskHash(contestID: number) {
  return `contest${contestID}:bestask`;
}

function lasttradeHash(contestID: number) {
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

function emailVer(rand: string) {
  return `emailVer:${rand}`;
}

function passReset(rand: string) {
  return `passReset:${rand}`;
}

export const rediskeys = {
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
