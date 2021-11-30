import cryptoRandomString from 'crypto-random-string'
import Joi from 'joi'

import { dv, tobj, validate, uError } from '../../util/util'
import validators from '../../util/util.schema'
import { client, rediskeys } from '../../../db/redis'
import config from '../../../config'

const schema = Joi.object({
  email: validators.email,
});

async function genVerify(req) {
  const { email } = validate(req, schema);
  try {
    const rand = cryptoRandomString({ length: config.verificationTokenLength, type: 'url-safe' });
    await client.SET(rediskeys.emailVer(rand), email, { EX: config.verificationTimeout * 60 });
    return sendVerificationEmail(email, rand);
  } catch (err) {
    return uError('genVerify Error', 406);
  }
}

async function sendVerificationEmail(email, rand) {
  const link = `${config.CallbackURL}/app/auth/verify?token=${rand}`;
  const msg = `Please click this link to verify your Ball Street account:\n${link}`;
  SendEmail(email, 'Verify your Ball Street Account', msg);
  return Promise.resolve({ needsVerification: true });
}

function SendEmail(to, subject, msg) {
  return {
    to,
    subject,
    msg,
  };
}

export default genVerify;
