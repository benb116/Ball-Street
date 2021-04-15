const session = require('express-session');
const redis = require('redis');

const redisClient = redis.createClient();
const RedisStore = require('connect-redis')(session);
const secret = require('../secret');

module.exports = session({
  secret: secret.cookieSecret,
  name: '_ballstreet',
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true, sameSite: true },
  store: new RedisStore({
    host: 'localhost',
    port: 6379,
    client: redisClient,
    ttl: 86400,
  }),
});
