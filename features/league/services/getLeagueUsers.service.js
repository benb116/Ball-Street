const Joi = require('joi');

const u = require('../../util/util');

const sequelize = require('../../../db');
const { Membership, User } = require('../../../models');
const { canUserSeeLeague } = require('../../util/util.service');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: Joi.number().integer().greater(0).required(),
  params: Joi.object().keys({
    leagueID: Joi.number().required(),
  }).required(),
  body: Joi.object().length(0),
});

function getLeagueUsers(req) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }

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
