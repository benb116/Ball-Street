import cryptoRandomString from 'crypto-random-string';
import Joi from 'joi';

import { CallbackURL, verificationTimeout, verificationTokenLength } from '../../../config';
import passReset from '../../../db/redis/passReset.redis';
import { uError, validate } from '../../util/util';
import validators from '../../util/util.schema';

const schema = Joi.object({
  email: validators.email,
});

interface GenPassResetInput {
  email: string,
}

/** Create and send a password reset email */
async function genPassReset(req: GenPassResetInput) {
  const value: GenPassResetInput = validate(req, schema);
  const { email } = value;
  try {
    const rand = cryptoRandomString({ length: verificationTokenLength, type: 'url-safe' });
    await passReset.set(rand, email, verificationTimeout * 60);
    return await sendPassResetEmail(email, rand);
  } catch (err) {
    return uError('genPassReset Error', 406);
  }
}

async function sendPassResetEmail(email: string, rand: string) {
  const link = `mailto:${email} ${CallbackURL}/resetPassword/${rand}`;
  return link;
}

export default genPassReset;
