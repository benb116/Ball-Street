const session = require('express-session');
const redis = require('redis');
const redisClient = redis.createClient();
const redisStore = require('connect-redis')(session);

module.exports = session({
    secret: 'ThisIsHowYouUseRedisSessionStorage',
    name: '_ballstreet',
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, sameSite: true, },
    store: new redisStore({ host: 'localhost', port: 6379, client: redisClient, ttl: 86400 }),
});