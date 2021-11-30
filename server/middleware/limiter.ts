import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { client } from '../db/redis'
import logger from '../utilities/logger'

// Rate limiter middleware
export default rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each token requests per windowMs
  onLimitReached(req, res) {
    logger.info('Rate limit', req);
    res.status(429).send({ error: 'Too many requests. Please wait a bit' });
  },
  store: new RedisStore({ client }),
});
