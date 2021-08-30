const cryptoRandomString = require('crypto-random-string');
const Joi = require('joi');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');
const { set, rediskeys } = require('../../../db/redis');
const config = require('../../../config');

const schema = Joi.object({
  email: validators.email,
});

async function genPassReset(req) {
  const { email } = u.validate(req, schema);
  try {
    const rand = cryptoRandomString({ length: config.verificationTokenLength, type: 'url-safe' });
    await set.key(rediskeys.passReset(rand), email, 'EX', config.verificationTimeout * 60);
    return await sendPassResetEmail(email, rand);
  } catch (err) {
    return u.Error('genPassReset Error', 406);
  }
}

async function sendPassResetEmail(email, rand) {
  const link = `${config.CallbackURL}/resetPassword/${rand}`;
  return link;
}

module.exports = genPassReset;
