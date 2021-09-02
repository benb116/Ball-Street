const bcrypt = require('bcrypt');
const Joi = require('joi');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');

const { User } = require('../../../models');
const genVerify = require('./genVerify.service');
const { errorHandler } = require('../../util/util.service');

const schema = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'Name is invalid',
    'any.required': 'Name is required',
  }),
  email: validators.email,
  password: validators.password,
  skipVerification: Joi.boolean().default(false),
});

async function signup(req) {
  const {
    name, email, password, skipVerification,
  } = u.validate(req, schema);
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const theuser = await User.create({
      name, email, pwHash: hash, verified: skipVerification,
    }).then(u.dv);
    if (!theuser) { u.Error('User could not be created', 500); }
    if (!skipVerification) return genVerify({ email: theuser.email });
    return { id: theuser.id, email: theuser.email, name: theuser.name };
  } catch (err) {
    return errorHandler({
      default: ['Could not create user', 500],
      'email must be unique': ['An account with that email already exists', 406],
      'User.name cannot be null': ['Please enter a name', 406],
    });
  }
}
module.exports = signup;
