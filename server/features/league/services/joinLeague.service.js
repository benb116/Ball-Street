const Joi = require('joi');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');

const sequelize = require('../../../db');
const { Membership, League } = require('../../../models');
const { errorHandler } = require('../../util/util.service');

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

async function joinLeague(req) {
  const value = u.validate(req, schema);

  return sequelize.transaction(isoOption, async (t) => {
    const theleague = await League.findByPk(value.params.leagueID, u.tobj(t)).then(u.dv);
    if (!theleague) { u.Error('No league found', 404); }
    if (!theleague.ispublic) { u.Error('Cannot join private league', 406); }
    return Membership.create({
      UserId: value.user,
      LeagueId: value.params.leagueID,
    }, u.tobj(t));
  }).catch(errorHandler({
    default: ['League could not be joined', 500],
    Memberships_pkey: ['User already is a member', 406],
  }));
}

module.exports = joinLeague;
