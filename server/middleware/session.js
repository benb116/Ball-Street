const session = require('express-session');
const connect = require('connect-redis');
const { client } = require('../db/redis');

const RedisStore = connect(session);
const secret = require('../secret');

module.exports = session({
  secret: secret.cookieSecret,
  name: '_ballstreet',
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true, sameSite: true, secure: process.env.NODE_ENV === 'production' },
  store: new RedisStore({
    client,
    ttl: 86400, // 1 day
  }),
});
