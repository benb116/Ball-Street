import express, { Request, Response } from 'express';

import { isUError, uError, UError } from '../util/util';
import logger from '../../utilities/logger';

import signup from './services/signup.service';
import login from './services/login.service';
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
    if (isUError(user)) throw user;
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
    if (isUError(user)) throw user;
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

interface VerifyInputType extends Request {
  query: {
    token: string
  }
}
router.get('/verify', async (req: VerifyInputType, res) => {
  const inp = { token: req.query.token };
  try {
    const user = await evalVerify(inp);
    if (isUError(user)) throw user;
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
    if (isUError(done)) throw done;
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

export default router;
