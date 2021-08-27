const bcrypt = require('bcrypt');
const Joi = require('joi');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');

const { User } = require('../../../models');
const genVerify = require('./genVerify.service');

const schema = Joi.object({
  email: validators.email,
  password: validators.password,
});

async function login(req) {
  const { email, password } = u.validate(req, schema);

  const theuser = await User.scope('withPassword').findOne({ where: { email } });
  if (!theuser) { u.Error('Wrong username or password', 401); }
  const match = await bcrypt.compare(password, theuser.pwHash);
  if (!match) { u.Error('Wrong username or password', 401); }
  if (!theuser.verified) {
    return genVerify({ email });
  }
  return { id: theuser.id, email: theuser.email, name: theuser.name };
}

module.exports = login;
