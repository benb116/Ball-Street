const Joi = require('joi');

const u = require('../../util/util');

const sequelize = require('../../../db');
const { Membership, League } = require('../../../models');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: Joi.number().integer().greater(0).required(),
  params: Joi.object().keys({
    leagueID: Joi.string().alphanum().trim().required(),
  }).required(),
  body: Joi.object().length(0),
});

async function join(req) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }

  return sequelize.transaction(isoOption, async (t) => {
    const theleague = League.findByPk(value.params.leagueID, u.tobj(t)).then(u.dv);
    if (!theleague.ispublic) { u.Error('No league found', 404); }
    return Membership.create({
      UserId: value.user,
      LeagueId: value.params.leagueID,
    }, u.tobj(t))
      .catch((err) => u.Error(err.parent.constraint, 406));
  });
}

module.exports = join;
