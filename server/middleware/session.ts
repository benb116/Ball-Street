import RedisStore from 'connect-redis';
import session from 'express-session';
import { createClient } from 'redis';

import { REDIS_PORT, REDIS_HOST } from '../db/redis';
import logger from '../utilities/logger';

const connObj = {
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
  socket: { connectTimeout: 10000 },
};
const client = createClient(connObj);
client.connect().catch(logger.error);

declare module 'express-session' {
  export interface SessionData {
    user: { id: number };
  }
}

/** Session middleware based on redis store */
export default session({
  secret: process.env['COOKIE_SECRET'] || 'defaultSecret',
  name: '_ballstreet',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: true,
    secure: (process.env['NODE_ENV'] === 'production'),
  },
  store: new RedisStore({ client, ttl: 86400 }), // 1 day
});
