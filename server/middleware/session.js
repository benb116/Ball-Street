const session = require('express-session');
const connect = require('connect-redis');
const { client } = require('../db/redis');

const RedisStore = connect(session);

module.exports = session({
  secret: process.env.COOKIE_SECRET,
  name: '_ballstreet',
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true, sameSite: true },
  store: new RedisStore({ client, ttl: 86400 }), // 1 day
});
