import cryptoRandomString from 'crypto-random-string';
import Joi from 'joi';

import { CallbackURL, verificationTimeout, verificationTokenLength } from '../../../config';

import { validate, uError } from '../../util/util';
import validators from '../../util/util.schema';

import { client, rediskeys } from '../../../db/redis';
import { SendForgotEmail } from '../../../utilities/email';

const schema = Joi.object({
  email: validators.email,
});

interface GenPassResetInput {
  email: string,
}

// Create and send a password reset email
async function genPassReset(req: GenPassResetInput) {
  const value: GenPassResetInput = validate(req, schema);
  const { email } = value;
  try {
    const rand = cryptoRandomString({ length: verificationTokenLength, type: 'url-safe' });
    await client.SET(rediskeys.passReset(rand), email, { EX: verificationTimeout * 60 });
    const link = `${CallbackURL}/resetPassword/${rand}`;
    return await SendForgotEmail(email, link);
  } catch (err) {
    return uError('Could not send password reset email', 406);
  }
}

export default genPassReset;
