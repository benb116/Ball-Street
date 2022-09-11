// Rate limiting middleware
// Using redis to share state between workers
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { client } from '../db/redis';

// const store = new RedisStore({
//   sendCommand: (...args: string[]) => client.sendCommand(args),
// });

const baseOptions = {
  standardHeaders: true,
  legacyHeaders: false,
};

/**
 * Returns a limiter middleware that limits the number of requests.
 * Set the number of requests and time window (default 1 minute)
 *
 * @param {number} numRequests The maximum number of requests.
 * @param {number} windowSeconds The time window.
*/
export default function limited(numRequests: number, windowSeconds = 60) {
  return rateLimit({
    windowMs: windowSeconds * 1000,
    max: numRequests, // Number of requests per window
    ...baseOptions,
    store: new RedisStore({
      sendCommand: (...args: string[]) => client.sendCommand(args),
    }),
  });
}
