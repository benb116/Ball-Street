import * as express from 'express'

const router = express.Router();

import authenticate from '../../middleware/authenticate'
import routeHandler from '../util/util.route'
import logger from '../../utilities/logger'

import signup from './services/signup.service'
import login from './services/login.service'
import getAccount from './services/getAccount.service'
import evalVerify from './services/evalVerify.service'

import genPassReset from './services/genPassReset.service'
import evalPassReset from './services/evalPassReset.service'

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
    const user = await login(inp);
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
    const user = await signup(inp);
    if (user.id) req.session.user = user; // add to session
    return res.json(user);
  } catch (err) {
    return errorHandler(res, err);
  }
});

router.get('/verify', async (req, res) => {
  const inp = { token: req.query.token };
  try {
    const user = await evalVerify(inp);
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
    const done = await genPassReset(inp);
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
    await evalPassReset(inp);
    req.session.destroy(() => {
      res.redirect('/login');
    });
    return true;
  } catch (err) {
    return errorHandler(res, err);
  }
});

router.get('/account', authenticate, routeHandler(getAccount));

router.delete('/logout', authenticate, (req, res) => {
  req.session.destroy(() => {
    res.send({ result: 'OK', message: 'Session destroyed' });
  });
});

export default router;
