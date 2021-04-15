const bcrypt = require('bcrypt');

const { User } = require('../../models');
const u = require('../util/util');

async function login(email, password) {
    try {
        const _user = await User.scope('withPassword').findOne({ where: { email: email } });
        const match = await bcrypt.compare(password, _user.pwHash);
        if (match) {
            return { id: _user.id, email: _user.email, name: _user.name };
        } else {
            return Promise.reject('Wrong username or password');
        }
    } catch(err) {
        return Promise.reject('User not found');
    }
}

async function getAccount(req) {
    try {
        return User.findByPk(req.session.user.id).then(u.dv);
    } catch(err) {
        return Promise.reject('User not found');
    }
}

async function signup(name, email, password) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const _user = await User.create({ name: name, email: email, pwHash: hash }).then(u.dv);
        if (_user) {
            return { id: _user.id, email: _user.email, name: _user.name };
        }
    } catch(err) {
        const errmess = err.errors[0].message;
        let outmess = 'Could not create user';
        switch (errmess) {
            case "email must be unique":     outmess = "An account with that email already exists";   break;
            case "User.name cannot be null": outmess = "Please enter a name";                         break;
        }
        return Promise.reject(outmess);
    }
}

module.exports = {
    signup,
    login,
    getAccount,
};