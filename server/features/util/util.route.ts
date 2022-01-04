// Common route handler function
// When a request is received, run the specified service function
// and return the results
// If there's an error, return the specified status and error message.

import { Request, Response } from 'express';

import { uError, isUError } from './util';
import { ServiceType } from './util.service';

import { client } from '../../db/redis';

function routeHandler(service: ServiceType, cacheExpiry = 0) {
  return async function routeHandlerInner(req: Request, res: Response) {
    try {
      // If a get request should be cached
      if (cacheExpiry && req.method === 'GET') {
        const cacheout = await client.GET(cachekey(req.originalUrl));
        if (cacheout) {
          return res.send(cacheout);
        }
      }
      const out = await service(stripReq(req));
      if (cacheExpiry && req.method === 'GET') {
        // Cache results
        client.SET(cachekey(req.originalUrl), JSON.stringify(out), { EX: cacheExpiry });
      }
      return res.json(out);
    } catch (err) {
      let outError;
      if (!isUError(err)) {
        if (err instanceof Error) outError = uError(err.message);
        outError = uError('Unknown error');
      } else {
        outError = err;
      }
      return res.status((outError.status || 500)).json({ error: outError.message || 'Unexpected error' });
    }
  };
}

function cachekey(url: string) {
  let key = url;
  if (url.slice(0, 4) === '/app') key = url.slice(4);
  if (key.slice(0, 4) === '/api') key = key.slice(4);
  return key;
}

// Strip extraneous info from input
function stripReq(inp: Request) {
  return {
    user: inp.session?.user?.id || 0,
    params: inp.params,
    body: inp.body,
  };
}

export default routeHandler;
