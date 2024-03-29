import Joi from 'joi';

import { verificationTokenLength } from '../../../config';
import emailVer from '../../../db/redis/emailVer.redis';
import { validate, uError } from '../../util/util';
import User from '../user.model';

const schema = Joi.object<EvalVerifyInput>({
  token: Joi.string().length(verificationTokenLength).required().messages({
    'string.base': 'Token is invalid',
    'string.length': `Token must be ${verificationTokenLength} characters long`,
    'any.required': 'Token is required',
  }),
});

interface EvalVerifyInput {
  token: string,
}

/** Check that a verification link is valid */
async function evalVerify(req: EvalVerifyInput) {
  const value = validate(req, schema);
  const { token } = value;
  const email = await emailVer.get(token);
  if (!email) throw uError('Email could not be verified', 404);
  emailVer.del(token);
  const usersUpdated = await User.update({ verified: true }, {
    where: { email }, returning: true,
  });
  if (!usersUpdated[1].length || !usersUpdated[1][0]) throw uError('No user found', 404);
  const theuser = usersUpdated[1][0];
  return { id: theuser.id, email: theuser.email, name: theuser.name };
}

export default evalVerify;
