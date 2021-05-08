const bcrypt = require('bcrypt');
const Joi = require('joi');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');

const { User } = require('../../../models');

const schema = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'Name is invalid',
    'any.required': 'Name is required',
  }),
  email: validators.email,
  password: validators.password,
});

async function signup(req) {
  const { name, email, password } = u.validate(req, schema);
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const theuser = await User.create({ name, email, pwHash: hash }).then(u.dv);
    if (!theuser) { u.Error('User could not be created', 500); }
    return { id: theuser.id, email: theuser.email, name: theuser.name };
  } catch (err) {
    const errmess = err.errors[0].message;
    let outmess = 'Could not create user';
    switch (errmess) {
      case 'email must be unique': outmess = 'An account with that email already exists'; break;
      case 'User.name cannot be null': outmess = 'Please enter a name'; break;
      default: break;
    }
    return u.Error(outmess, 406);
  }
}
module.exports = signup;
