const cryptoRandomString = require('crypto-random-string');
const Joi = require('joi');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');
const { set, rediskeys } = require('../../../db/redis');
const config = require('../../../config');

const schema = Joi.object({
  email: validators.email,
});

async function genVerify(req) {
  const { email } = u.validate(req, schema);
  try {
    const rand = cryptoRandomString({ length: config.verificationTokenLength, type: 'url-safe' });
    await set.key(rediskeys.emailVer(rand), email, 'EX', config.verificationTimeout * 60);
    return sendVerificationEmail(email, rand);
  } catch (err) {
    return u.Error('genVerify Error', 406);
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

module.exports = genVerify;
