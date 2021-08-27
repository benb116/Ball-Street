const router = require('express').Router();

const service = require('./user.service');
const authenticate = require('../../middleware/authenticate');
const { routeHandler } = require('../util/util.route');

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
    if (!err) {
      // eslint-disable-next-line no-console
      console.log(err);
      return res.status(500).json({ error: 'Unexpected error' });
    }
    return res.status((err.status || 500)).json({ error: err.message || 'Unexpected error' });
  }
});

router.get('/account', authenticate, routeHandler(service.getAccount));

router.post('/signup', async (req, res) => {
  const inp = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };
  try {
    const user = await service.signup(inp);
    req.session.user = user; // add to session
    return res.json(user);
  } catch (err) {
    if (!err) {
      // eslint-disable-next-line no-console
      console.log(err);
      return res.status(500).json({ error: 'Unexpected error' });
    }
    return res.status((err.status || 500)).json({ error: err.message || 'Unexpected error' });
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
    if (!err) {
      // eslint-disable-next-line no-console
      console.log(err);
      return res.status(500).json({ error: 'Unexpected error' });
    }
    return res.status((err.status || 500)).json({ error: err.message || 'Unexpected error' });
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
      res.send({ result: 'OK', message: 'Session destroyed' });
    });
    return true;
  } catch (err) {
    if (!err) {
      // eslint-disable-next-line no-console
      console.log(err);
      return res.status(500).json({ error: 'Unexpected error' });
    }
    return res.status((err.status || 500)).json({ error: err.message || 'Unexpected error' });
  }
});

router.get('/account', authenticate, routeHandler(service.getAccount));

router.delete('/logout', authenticate, (req, res) => {
  req.session.destroy(() => {
    res.send({ result: 'OK', message: 'Session destroyed' });
  });
});

module.exports = router;
