import cryptoRandomString from 'crypto-random-string';
import Joi from 'joi';

import { validate, uError } from '../../util/util';
import validators from '../../util/util.schema';
import { client, rediskeys } from '../../../db/redis';
import { CallbackURL, verificationTimeout, verificationTokenLength } from '../../../config';

const schema = Joi.object({
  email: validators.email,
});

async function genPassReset(req) {
  const { email } = validate(req, schema);
  try {
    const rand = cryptoRandomString({ length: verificationTokenLength, type: 'url-safe' });
    await client.SET(rediskeys.passReset(rand), email, { EX: verificationTimeout * 60 });
    return await sendPassResetEmail(email, rand);
  } catch (err) {
    return uError('genPassReset Error', 406);
  }
}

async function sendPassResetEmail(email: string, rand: string) {
  const link = `${CallbackURL}/resetPassword/${rand}`;
  return link;
}

export default genPassReset;
