const Joi = require('joi');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');

const { User } = require('../../../models');

const schema = Joi.object({
  user: validators.user,
  params: validators.noObj,
  body: validators.noObj,
});

async function getAccount(req) {
  const value = u.validate(req, schema);
  const theuser = await User.findByPk(value.user).then(u.dv);
  if (!theuser) { u.Error('User not found', 404); }
  return theuser;
}

module.exports = getAccount;
