import cryptoRandomString from 'crypto-random-string';
import Joi from 'joi';

import { CallbackURL, verificationTimeout, verificationTokenLength } from '../../../config';

import { validate, uError } from '../../util/util';
import validators from '../../util/util.schema';

import { client, rediskeys } from '../../../db/redis';

const schema = Joi.object({
  id: validators.user,
  email: validators.email,
});

interface EvalVerifyInput {
  id: number,
  email: string,
}

// Create and send an email verification link
async function genVerify(req: EvalVerifyInput) {
  const value: EvalVerifyInput = validate(req, schema);
  const { email, id } = value;
  try {
    const rand = cryptoRandomString({ length: verificationTokenLength, type: 'url-safe' });
    await client.SET(rediskeys.emailVer(rand), email, { EX: verificationTimeout * 60 });
    return await sendVerificationEmail(id, email, rand);
  } catch (err) {
    return uError('genVerify Error', 406);
  }
}

async function sendVerificationEmail(id: number, email: string, rand: string) {
  const link = `${CallbackURL}/app/auth/verify?token=${rand}`;
  const msg = `Please click this link to verify your Ball Street account:\n${link}`;
  SendEmail(email, 'Verify your Ball Street Account', msg);
  return Promise.resolve({ needsVerification: true, id });
}

function SendEmail(to: string, subject: string, msg: string) {
  return {
    to,
    subject,
    msg,
  };
}

export default genVerify;
