const bcrypt = require('bcrypt');

const { User } = require('../models');
const u = require('../util');

async function login(email, password) {
    try {
        const user = await User.findOne({email: email});

        // we do not need to hash our plain text password
        // before we pass it to bcrypt.compare
        // bcrypt.compare will always return resolved Promise with a boolean value
        // indicating whether the password hashes match
        const match = await bcrypt.compare(password, user.pwHash);

        if (match) {
            return { id: user.id };
        } else {
            return Promise.reject('wrong username or password');
        }
    } catch(err) {
        return Promise.reject('user not found');
    }
}

async function signup(email, password) {
    // generate salt to hash password
    const salt = await bcrypt.genSalt(10);
    // now we set user password to hashed password
    const hash = await bcrypt.hash(password, salt);

    return User.create({
        email: email,
        pwHash: hash
    }).then(u.dv).then(u => {
        return { id: u.id };
    });
}

module.exports = {
    signup,
    login,
};