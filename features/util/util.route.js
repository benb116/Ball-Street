// Common route handler function
// When a request is received, run the specified service function
// and return the results
// If there's an error, return the specified status and error message.

function routeHandler(service) {
  return async function routeHandlerInner(req, res) {
    try {
      const out = await service(req);
      return res.json(out);
    } catch (err) {
      // eslint-disable-next-line no-console
      if (!err) { console.log(err); }
      return res.status((err.status || 500)).json({ error: err.message });
    }
  };
}

module.exports = { routeHandler };
