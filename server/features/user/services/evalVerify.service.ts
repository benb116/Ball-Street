import Joi from 'joi';

import { dv, validate, uError } from '../../util/util';
import { rediskeys, client } from '../../../db/redis';
import { verificationTokenLength } from '../../../config';
import { User } from '../../../models';

const schema = Joi.object({
  token: Joi.string().length(verificationTokenLength).required().messages({
    'string.base': 'Token is invalid',
    'string.length': `Token must be ${verificationTokenLength} characters long`,
    'any.required': 'Token is required',
  }),
});

async function evalVerify(req) {
  const { token } = validate(req, schema);
  const email = await client.GET(rediskeys.emailVer(token));
  if (!email) uError('Email could not be verified', 404);
  client.DEL(rediskeys.emailVer(token));
  const user = await User.update({ verified: true }, {
    where: { email }, returning: true, plain: true,
  });
  const theuser = dv(user[1]);
  return { id: theuser.id, email: theuser.email, name: theuser.name };
}

export default evalVerify;
