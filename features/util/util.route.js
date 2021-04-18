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
