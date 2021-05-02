// Common route handler function
// When a request is received, run the specified service function
// and return the results
// If there's an error, return the specified status and error message.

const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

function routeHandler(service, cacheExpiry) {
  return async function routeHandlerInner(req, res) {
    try {
      if (cacheExpiry && req.method === 'GET') {
        const cacheout = await getAsync(req.originalUrl);
        if (cacheout) {
          return res.send(cacheout);
        }
      }
      const out = await service(stripReq(req));
      if (cacheExpiry && req.method === 'GET') {
        await setAsync(req.originalUrl, JSON.stringify(out), 'EX', cacheExpiry);
      }
      return res.json(out);
    } catch (err) {
      // eslint-disable-next-line no-console
      if (!err) { console.log(err); }
      return res.status((err.status || 500)).json({ error: err.message });
    }
  };
}

function stripReq(inp) {
  const out = {};
  out.user = inp.session.user.id;
  out.params = inp.params;
  out.body = inp.body;
  return out;
}

module.exports = { routeHandler };
