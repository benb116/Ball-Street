const session = require('express-session');
const connect = require('connect-redis');

const { createClient } = require('redis');
const { REDIS_PORT, REDIS_HOST } = require('../db/redis');

const connObj = {
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
  socket: { connectTimeout: 10000 },
  legacyMode: true,
};
const client = createClient(connObj);
client.connect();

const RedisStore = connect(session);

module.exports = session({
  secret: process.env.COOKIE_SECRET,
  name: '_ballstreet',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    sameSite: true,
    secure: (process.env.NODE_ENV === 'production'),
  },
  store: new RedisStore({ client, ttl: 86400 }), // 1 day
});
