import Joi from 'joi';

import { verificationTokenLength } from '../../../config';

import { validate, uError } from '../../util/util';

import { rediskeys, client } from '../../../db/redis';

import User from '../user.model';

const schema = Joi.object({
  token: Joi.string().length(verificationTokenLength).required().messages({
    'string.base': 'Token is invalid',
    'string.length': `Token must be ${verificationTokenLength} characters long`,
    'any.required': 'Token is required',
  }),
});

interface EvalVerifyInput {
  token: string,
}

// Check that a verification link is valid
async function evalVerify(req: EvalVerifyInput) {
  const value: EvalVerifyInput = validate(req, schema);
  const { token } = value;
  const email = await client.GET(rediskeys.emailVer(token));
  if (!email) uError('Email could not be verified', 404);
  client.DEL(rediskeys.emailVer(token));
  const usersUpdated = await User.update({ verified: true }, {
    where: { email }, returning: true,
  });
  if (!usersUpdated[1].length) return uError('No user found', 404);
  const theuser = usersUpdated[1][0];
  return { id: theuser.id, email: theuser.email, name: theuser.name };
}

export default evalVerify;
