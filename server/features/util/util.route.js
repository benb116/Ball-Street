// Common route handler function
// When a request is received, run the specified service function
// and return the results
// If there's an error, return the specified status and error message.

// const redis = require('redis');
const { promisify } = require('util');

const { client } = require('../../db/redis');

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

function routeHandler(service, cacheExpiry) {
  return async function routeHandlerInner(req, res) {
    try {
      // If a get request should be cached
      if (cacheExpiry && req.method === 'GET') {
        // Check if it's been cached already
        const cacheout = await getAsync(req.originalUrl);
        if (cacheout) {
          return res.send(cacheout);
        }
      }
      const out = await service(stripReq(req));
      if (cacheExpiry && req.method === 'GET') {
        // Cache results
        await setAsync(req.originalUrl, JSON.stringify(out), 'EX', cacheExpiry);
      }
      return res.json(out);
    } catch (err) {
      if (!err) {
        // eslint-disable-next-line no-console
        console.log(err);
        return res.status(500).json({ error: 'Unexpected error' });
      }
      return res.status((err.status || 500)).json({ error: err.message });
    }
  };
}

// Strip extraneous info from input
function stripReq(inp) {
  const out = {};
  out.user = (inp.session ? inp.session.user.id : null);
  out.params = inp.params;
  out.body = inp.body;
  return out;
}

module.exports = { routeHandler };
