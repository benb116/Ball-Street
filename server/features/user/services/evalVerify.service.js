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
  const user = await User.findOne({ where: { email } });
  user.verified = true;
  await user.save();
  const theuser = u.dv(user);
  return { id: theuser.id, email: theuser.email, name: theuser.name };
}

module.exports = evalVerify;
