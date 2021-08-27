const Joi = require('joi');

const u = require('../../util/util');
const { rediskeys, get, del } = require('../../../db/redis');
const config = require('../../../config');
const { User } = require('../../../models');

const schema = Joi.object({
  token: Joi.string().length(config.verificationTokenLength).required().messages({
    'string.base': 'Token is invalid',
    'string.length': `Token must be ${config.verificationTokenLength} characters long`,
    'any.required': 'Token is required',
  }),
});

async function evalVerify(req) {
  const { token } = u.validate(req, schema);
  const email = await get.key(rediskeys.emailVer(token));
  if (!email) u.Error('Email could not be verified', 404);
  del.key(rediskeys.emailVer(token));
  const updated = await User.update({ verified: true }, { where: { email } });
  if (updated !== 1) u.Error('Email could not be verified', 404);
  return { verified: true };
}

module.exports = evalVerify;
