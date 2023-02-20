import cryptoRandomString from 'crypto-random-string';
import Joi from 'joi';

import { CallbackURL, verificationTimeout, verificationTokenLength } from '../../../config';
import emailVer from '../../../db/redis/emailVer.redis';
import { validate, uError } from '../../util/util';
import validators from '../../util/util.schema';

import type { GenVerifyOutputType } from '../../../../types/api/user.api';

const schema = Joi.object<GenVerifyInputType>({
  id: validators.user,
  email: validators.email,
});

interface GenVerifyInputType {
  id: number,
  email: string,
}

/** Create and send an email verification link */
async function genVerify(req: GenVerifyInputType) {
  const value = validate(req, schema);
  const { email, id } = value;
  try {
    const rand = cryptoRandomString({ length: verificationTokenLength, type: 'url-safe' });
    await emailVer.set(rand, email, verificationTimeout * 60);
    return await sendVerificationEmail(id, email, rand) as GenVerifyOutputType;
  } catch (err) {
    throw uError('genVerify Error', 406);
  }
}

async function sendVerificationEmail(id: number, email: string, rand: string) {
  const link = `${CallbackURL}/app/auth/verify?token=${rand}`;
  const msg = `Please click this link to verify your Ball Street account:\n${link}`;
  SendEmail(email, 'Verify your Ball Street Account', msg);
  return { needsVerification: true, id };
}

function SendEmail(to: string, subject: string, msg: string) {
  return {
    to,
    subject,
    msg,
  };
}

export default genVerify;
