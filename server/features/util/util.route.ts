// Common route handler function
// When a request is received, run the specified service function
// and return the results
// If there's an error, return the specified status and error message.

import { client } from '../../db/redis';

function routeHandler(service, cacheExpiry = 0) {
  return async function routeHandlerInner(req, res) {
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
    } catch (err) {
      return res.status((err?.status || 500)).json({ error: err?.message || 'Unexpected error' });
    }
  };
}

// Strip extraneous info from input
function stripReq(inp) {
  const out = {};
  out.user = inp.session?.user?.id || null;
  out.params = inp.params;
  out.body = inp.body;
  return out;
}

export default routeHandler;
