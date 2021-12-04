import { NextFunction, Request, Response } from 'express';

// Middleware to check if a user is logged in (via session)
function authenticate(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.user || !req.session.user.id) {
    return res.status(401).send({ error: 'You are not logged in' });
  }
  return next();
}

export default authenticate;
