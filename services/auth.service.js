const bcrypt = require('bcrypt');

const { User } = require('../models');
const u = require('../util');

async function login(email, password) {
  try {
    const theuser = await User.findOne({ where: { email } });
    const match = await bcrypt.compare(password, theuser.pwHash);
    if (match) {
      return { id: theuser.id, email: theuser.email, name: theuser.name };
    }
    return Promise.reject(new Error('Wrong username or password'));
  } catch (err) {
    return Promise.reject(new Error('User not found'));
  }
}

async function getAccount(req) {
  try {
    return User.findByPk(req.session.user.id).then(u.dv);
  } catch (err) {
    return Promise.reject(new Error('User not found'));
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
    throw new Error('Could not create account');
  } catch (err) {
    const errmess = err.errors[0].message;
    let outmess = 'Could not create user';
    switch (errmess) {
      case 'email must be unique': outmess = 'An account with that email already exists'; break;
      case 'User.name cannot be null': outmess = 'Please enter a name'; break;
      default: outmess = 'Unknown Error';
    }
    return Promise.reject(new Error(outmess));
  }
}

module.exports = {
  signup,
  login,
  getAccount,
};
