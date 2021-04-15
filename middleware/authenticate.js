function authenticate(req, res, next) {
  if (!req.session || !req.session.user) {
    // const err = new Error('You shall not pass');
    // err.statusCode = 401;
    // ;
    return res.status(401).send({ error: 'You are not logged in' });
  }
  return next();
}

module.exports = authenticate;
