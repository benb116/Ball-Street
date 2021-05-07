const Joi = require('joi');

const u = require('../../util/util');

const sequelize = require('../../../db');
const { Membership, User } = require('../../../models');
const { canUserSeeLeague } = require('../../util/util.service');
const { validators } = require('../../util/util.schema');

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

function getLeagueUsers(req) {
  const value = u.validate(req, schema);

  return sequelize.transaction(isoOption, async (t) => {
    const theleague = await canUserSeeLeague(t, value.user, value.params.leagueID);
    if (theleague.ispublic) { return []; }
    const queryObj = {
      where: {
        LeagueId: value.params.leagueID,
      },
      include: {
        model: User,
      },
    };
    return Membership.findAll(queryObj, u.tobj(t)).then(u.dv)
      .then((records) => records.map((r) => r.User))
      .then((users) => users.map((user) => user.name));
  });
}

module.exports = getLeagueUsers;
