const signup = require('./services/signup.service');
const login = require('./services/login.service');
const getAccount = require('./services/getAccount.service');
const genVerify = require('./services/genVerify.service');
const evalVerify = require('./services/evalVerify.service');

const genPassReset = require('./services/genPassReset.service');
const evalPassReset = require('./services/evalPassReset.service');

module.exports = {
  signup,
  login,
  getAccount,
  genPassReset,
  evalPassReset,
  genVerify,
  evalVerify,
};
