import session from 'express-session';
import connect from 'connect-redis';
import { createClient } from 'redis';
import { REDIS_PORT, REDIS_HOST } from '../db/redis';
import secret from '../secret';

const connObj = {
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
  socket: { connectTimeout: 10000 },
  legacyMode: true,
};
const client = createClient(connObj);
client.connect();

const RedisStore = connect(session);

export default session({
  secret: (process.env.COOKIE_SECRET || secret.cookieSecret),
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