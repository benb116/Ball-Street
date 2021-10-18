const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { client } = require('../db/redis');
const logger = require('../utilities/logger');

// Rate limiter middleware
module.exports = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each token requests per windowMs
  onLimitReached(req, res) {
    logger.info('Rate limit', req);
    res.status(429).send({ error: 'Too many requests. Please wait a bit' });
  },
  store: new RedisStore({ client }),
});
