const bcrypt = require('bcrypt');

const u = require('../util/util');

const { User } = require('../../models');

async function login(email, password) {
  try {
    const theuser = await User.scope('withPassword').findOne({ where: { email } });
    const match = await bcrypt.compare(password, theuser.pwHash);
    if (match) {
      return { id: theuser.id, email: theuser.email, name: theuser.name };
    }
    return u.Error('Wrong username or password', 401);
  } catch (err) {
    return u.Error('User not found', 404);
  }
}

async function getAccount(req) {
  try {
    return User.findByPk(req.session.user.id).then(u.dv);
  } catch (err) {
    return u.Error('User not found', 404);
  }
}

async function signup(name, email, password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const theuser = await User.create({ name, email, pwHash: hash }).then(u.dv);
    if (theuser) {
      return { id: theuser.id, email: theuser.email, name: theuser.name };
    }
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
  return 0;
}

module.exports = {
  signup,
  login,
  getAccount,
};
