const Joi = require('joi');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');

const sequelize = require('../../../db');
const { Membership, League } = require('../../../models');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    leagueID: validators.leagueID,
  }).required(),
  body: validators.noObj,
});

async function join(req) {
  const value = u.validate(req, schema);

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
