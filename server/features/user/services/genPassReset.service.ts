import cryptoRandomString from 'crypto-random-string'
import Joi from 'joi'

import { dv, tobj, validate, uError } from '../../util/util'
import validators from '../../util/util.schema'
import { client, rediskeys } from '../../../db/redis'
import config from '../../../config'

const schema = Joi.object({
  email: validators.email,
});

async function genPassReset(req) {
  const { email } = validate(req, schema);
  try {
    const rand = cryptoRandomString({ length: config.verificationTokenLength, type: 'url-safe' });
    await client.SET(rediskeys.passReset(rand), email, { EX: config.verificationTimeout * 60 });
    return await sendPassResetEmail(email, rand);
  } catch (err) {
    return uError('genPassReset Error', 406);
  }
}

async function sendPassResetEmail(email, rand) {
  const link = `${config.CallbackURL}/resetPassword/${rand}`;
  return link;
}

export default genPassReset;
