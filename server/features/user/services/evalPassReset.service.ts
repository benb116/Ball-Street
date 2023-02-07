import bcrypt from 'bcryptjs';
import Joi from 'joi';

import { inputEvalPassReset } from '../../../../types/api/user.api';
import { verificationTokenLength } from '../../../config';
import passReset from '../../../db/redis/passReset.redis';
import { validate, uError, OnCompare } from '../../util/util';
import validators from '../../util/util.schema';
import User from '../user.model';

import type { EvalPassResetInputType } from '../../../../types/api/user.api';

const schema = Joi.object({
  token: Joi.string().length(verificationTokenLength).required().messages({
    'string.base': 'Token is invalid',
    'string.length': `Token must be ${verificationTokenLength} characters long`,
    'any.required': 'Token is required',
  }),
  password: validators.password,
  confirmPassword: validators.password,
});
validate(inputEvalPassReset, schema);

/** Change a user's password */
async function evalPassReset(req: EvalPassResetInputType) {
  const value: EvalPassResetInputType = validate(req, schema);
  const { token, password, confirmPassword } = value;
  if (OnCompare(password, confirmPassword)) throw uError('Passwords do not match', 403);
  const email = await passReset.get(token);
  if (!email) throw uError('Reset key could not be found, please try again', 404);

  passReset.del(token);
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const theuser = await User.update({ pwHash: hash }, { where: { email } });
  if (!theuser) throw uError('Password could not be changed', 404);
  // Send email telling user their password has been reset
  return true;
}

export default evalPassReset;
