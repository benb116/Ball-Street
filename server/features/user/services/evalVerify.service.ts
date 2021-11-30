import Joi from 'joi'

import { dv, tobj, validate, uError } from '../../util/util'
import { rediskeys, client } from '../../../db/redis'
import config from '../../../config'
import { User } from '../../../models'

const schema = Joi.object({
  token: Joi.string().length(config.verificationTokenLength).required().messages({
    'string.base': 'Token is invalid',
    'string.length': `Token must be ${config.verificationTokenLength} characters long`,
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
