// Common route handler function
// When a request is received, run the specified service function
// and return the results
// If there's an error, return the specified status and error message.

import { Request, Response } from 'express';
import { client } from '../../db/redis';
import { UError } from './util';
import { ServiceType } from './util.service';

function routeHandler(service: ServiceType, cacheExpiry = 0) {
  return async function routeHandlerInner(req: Request, res: Response) {
    try {
      // If a get request should be cached
      if (cacheExpiry && req.method === 'GET') {
        // Check if it's been cached already
        const cacheout = await client.GET(req.originalUrl);
        if (cacheout) {
          return res.send(cacheout);
        }
      }
      const out = await service(stripReq(req));
      if (cacheExpiry && req.method === 'GET') {
        // Cache results
        await client.SET(req.originalUrl, JSON.stringify(out), { EX: cacheExpiry });
      }
      return res.json(out);
    } catch (err: any) {
      const uerr: UError = err;
      return res.status((uerr.status || 500)).json({ error: uerr.message || 'Unexpected error' });
    }
  };
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
