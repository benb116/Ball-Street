const Joi = require('joi');

const u = require('../../util/util');

const sequelize = require('../../../db');
const { Membership, League } = require('../../../models');
const { validators } = require('../../util/util.schema');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: validators.user,
  params: validators.noObj,
  body: Joi.object().keys({
    name: Joi.string().trim().required().messages({
      'string.base': 'Name is invalid',
      'any.required': 'Please specify a name',
    }),
  }).required(),
});

async function createLeague(req) {
  const value = u.validate(req, schema);

  const obj = {};
  obj.adminId = value.user;
  obj.name = value.body.name;
  obj.ispublic = false;
  return sequelize.transaction(isoOption, async (t) => {
    const newleague = await League.create(obj, { transaction: t }).then(u.dv);
    await Membership.create({
      UserId: obj.adminId,
      LeagueId: newleague.id,
    }, u.tobj(t))
      .catch((err) => u.Error(err.parent.constraint, 406));
    return newleague;
  });
}

module.exports = createLeague;
