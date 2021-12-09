import bcrypt from 'bcrypt';
import Joi from 'joi';

import { validate, uError, OnCompare } from '../../util/util';
import { rediskeys, client } from '../../../db/redis';
import { verificationTokenLength } from '../../../config';
import { User } from '../../../models';
import validators from '../../util/util.schema';

const schema = Joi.object({
  token: Joi.string().length(verificationTokenLength).required().messages({
    'string.base': 'Token is invalid',
    'string.length': `Token must be ${verificationTokenLength} characters long`,
    'any.required': 'Token is required',
  }),
  password: validators.password,
  confirmPassword: validators.password,
});

interface EvalPassResetInput {
  token: string,
  password: string,
  confirmPassword: string,
}

async function evalPassReset(req: EvalPassResetInput) {
  const { token, password, confirmPassword } = validate(req, schema);
  if (OnCompare(password, confirmPassword)) uError('Passwords do not match', 403);
  const email = await client.GET(rediskeys.passReset(token));
  if (!email) uError('Reset key could not be found, please try again', 404);

  client.DEL(rediskeys.passReset(token));
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const theuser = await User.update({ pwHash: hash }, { where: { email } });
  if (!theuser) uError('Password could not be changed', 404);
  // Send email telling user their password has been reset
  return true;
}

export default evalPassReset;
