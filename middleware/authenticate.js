// Middleware to check if a user is logged in (via session)
function authenticate(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).send({ error: 'You are not logged in' });
  }
  return next();
}

module.exports = authenticate;
