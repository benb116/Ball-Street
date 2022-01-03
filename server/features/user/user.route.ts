import express, { Response } from 'express';

import { isUError, uError, UError } from '../util/util';
import routeHandler from '../util/util.route';
import logger from '../../utilities/logger';

import authenticate from '../../middleware/authenticate';

import signup from './services/signup.service';
import login from './services/login.service';
import getAccount from './services/getAccount.service';
import evalVerify from './services/evalVerify.service';
import genPassReset from './services/genPassReset.service';
import evalPassReset from './services/evalPassReset.service';

const router = express.Router();

function userErrorHandler(res: Response, err: UError) {
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
    if (!user.needsVerification) req.session.user = { id: user.id }; // add to session
    return res.json(user);
  } catch (err) {
    if (!isUError(err)) {
      if (err instanceof Error) return userErrorHandler(res, uError(err.message));
      return userErrorHandler(res, uError('Unknown error'));
    }
    return userErrorHandler(res, err);
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
    if (!user.needsVerification) req.session.user = { id: user.id }; // add to session
    return res.json(user);
  } catch (err) {
    if (!isUError(err)) {
      if (err instanceof Error) return userErrorHandler(res, uError(err.message));
      return userErrorHandler(res, uError('Unknown error'));
    }
    return userErrorHandler(res, err);
  }
});

router.get('/verify', async (req, res) => {
  const token: string = req.query.token as string;
  const inp = { token };
  try {
    const user = await evalVerify(inp);
    req.session.user = { id: user.id }; // add to session
    return res.redirect('/verified');
  } catch (err) {
    if (!isUError(err)) {
      if (err instanceof Error) return userErrorHandler(res, uError(err.message));
      return userErrorHandler(res, uError('Unknown error'));
    }
    return userErrorHandler(res, err);
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
    if (!isUError(err)) {
      if (err instanceof Error) return userErrorHandler(res, uError(err.message));
      return userErrorHandler(res, uError('Unknown error'));
    }
    return userErrorHandler(res, err);
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
    if (!isUError(err)) {
      if (err instanceof Error) return userErrorHandler(res, uError(err.message));
      return userErrorHandler(res, uError('Unknown error'));
    }
    return userErrorHandler(res, err);
  }
});

router.get('/account', authenticate, routeHandler(getAccount));

router.delete('/logout', authenticate, (req, res) => {
  req.session.destroy(() => {
    res.send({ result: 'OK', message: 'Session destroyed' });
  });
});

export default router;
