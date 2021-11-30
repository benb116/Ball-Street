const router = require('express').Router();

const service = require('./user.service');
const authenticate = require('../../middleware/authenticate');
const { routeHandler } = require('../util/util.route');
const logger = require('../../utilities/logger');

function errorHandler(res, err) {
  if (!err) {
    logger.error(err);
    return res.status(500).json({ error: 'Unexpected error' });
  }
  return res.status((err.status || 500)).json({ error: err.message || 'Unexpected error' });
}

router.post('/login', async (req, res) => {
  const inp = {
    email: req.body.email,
    password: req.body.password,
  };
  try {
    const user = await service.login(inp);
    req.session.user = user; // add to session
    return res.json(user);
  } catch (err) {
    return errorHandler(res, err);
  }
});

router.post('/signup', async (req, res) => {
  const inp = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    skipVerification: req.body.skipVerification,
  };
  try {
    const user = await service.signup(inp);
    if (user.id) req.session.user = user; // add to session
    return res.json(user);
  } catch (err) {
    return errorHandler(res, err);
  }
});

router.get('/verify', async (req, res) => {
  const inp = { token: req.query.token };
  try {
    const user = await service.evalVerify(inp);
    req.session.user = user; // add to session
    return res.redirect('/verified');
  } catch (err) {
    return errorHandler(res, err);
  }
});

router.post('/forgot', async (req, res) => {
  const inp = {
    email: req.body.email,
  };
  try {
    const done = await service.genPassReset(inp);
    return res.json({ resetLinkSent: done });
  } catch (err) {
    return errorHandler(res, err);
  }
});

router.post('/resetPasswordToken', async (req, res) => {
  const inp = {
    token: req.body.token,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  };
  try {
    await service.evalPassReset(inp);
    req.session.destroy(() => {
      res.redirect('/login');
    });
    return true;
  } catch (err) {
    return errorHandler(res, err);
  }
});

router.get('/account', authenticate, routeHandler(service.getAccount));

router.delete('/logout', authenticate, (req, res) => {
  req.session.destroy(() => {
    res.send({ result: 'OK', message: 'Session destroyed' });
  });
});

module.exports = router;
