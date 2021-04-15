function routeHandler(service) {
  return async function routeHandlerInner(req, res) {
    try {
      const out = await service(req);
      return res.json(out);
    } catch (err) {
      return res.status(err.status).json({ error: err.message });
    }
  };
}

module.exports = { routeHandler };
