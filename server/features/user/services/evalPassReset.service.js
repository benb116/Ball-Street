const bcrypt = require('bcrypt');
const Joi = require('joi');

const u = require('../../util/util');
const { rediskeys, get, del } = require('../../../db/redis');
const config = require('../../../config');
const { User } = require('../../../models');
const { validators } = require('../../util/util.schema');

const schema = Joi.object({
  token: Joi.string().length(config.verificationTokenLength).required().messages({
    'string.base': 'Token is invalid',
    'string.length': `Token must be ${config.verificationTokenLength} characters long`,
    'any.required': 'Token is required',
  }),
  password: validators.password,
  confirmPassword: validators.password,
});

async function evalPassReset(req) {
  const { token, password, confirmPassword } = u.validate(req, schema);
  if (password !== confirmPassword) u.Error('Passwords do not match', 403);
  const email = await get.key(rediskeys.passReset(token));
  if (!email) u.Error('Reset key could not be found, please try again', 404);

  del.key(rediskeys.passReset(token));
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const theuser = await User.update({ pwHash: hash }, { where: { email } });
  if (!theuser) u.Error('Password could not be changed', 404);
  // Send email telling user their password has been reset
  return true;
}

module.exports = evalPassReset;
