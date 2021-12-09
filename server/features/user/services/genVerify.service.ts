import cryptoRandomString from 'crypto-random-string';
import Joi from 'joi';

import { validate, uError } from '../../util/util';
import validators from '../../util/util.schema';
import { client, rediskeys } from '../../../db/redis';
import { CallbackURL, verificationTimeout, verificationTokenLength } from '../../../config';

const schema = Joi.object({
  email: validators.email,
});

interface EvalVerifyInput {
  email: string,
}

async function genVerify(req: EvalVerifyInput) {
  const { email } = validate(req, schema);
  try {
    const rand = cryptoRandomString({ length: verificationTokenLength, type: 'url-safe' });
    await client.SET(rediskeys.emailVer(rand), email, { EX: verificationTimeout * 60 });
    return await sendVerificationEmail(email, rand);
  } catch (err) {
    return uError('genVerify Error', 406);
  }
}

async function sendVerificationEmail(email: string, rand: string) {
  const link = `${CallbackURL}/app/auth/verify?token=${rand}`;
  const msg = `Please click this link to verify your Ball Street account:\n${link}`;
  SendEmail(email, 'Verify your Ball Street Account', msg);
  return Promise.resolve({ needsVerification: true, id: 0 });
}

function SendEmail(to: string, subject: string, msg: string) {
  return {
    to,
    subject,
    msg,
  };
}

export default genVerify;
