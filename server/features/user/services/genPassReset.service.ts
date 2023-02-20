import cryptoRandomString from 'crypto-random-string';
import Joi from 'joi';

import { inputGenPassReset } from '../../../../types/api/user.api';
import { CallbackURL, verificationTimeout, verificationTokenLength } from '../../../config';
import passReset from '../../../db/redis/passReset.redis';
import { validate, uError } from '../../util/util';
import validators from '../../util/util.schema';

import type { GenPassResetInputType } from '../../../../types/api/user.api';

const schema = Joi.object<GenPassResetInputType>({
  email: validators.email,
});
validate(inputGenPassReset, schema);

/** Create and send a password reset email */
async function genPassReset(req: GenPassResetInputType) {
  const value = validate(req, schema);
  const { email } = value;
  try {
    const rand = cryptoRandomString({ length: verificationTokenLength, type: 'url-safe' });
    await passReset.set(rand, email, verificationTimeout * 60);
    return await sendPassResetEmail(email, rand);
  } catch (err) {
    throw uError('genPassReset Error', 406);
  }
}

async function sendPassResetEmail(email: string, rand: string) {
  const link = `mailto:${email} ${CallbackURL}/resetPassword/${rand}`;
  return link;
}

export default genPassReset;
