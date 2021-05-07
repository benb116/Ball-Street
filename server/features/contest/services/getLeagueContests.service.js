const Joi = require('joi');

const u = require('../../util/util');

const sequelize = require('../../../db');
const { Contest } = require('../../../models');
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

function getLeagueContests(req) {
  const value = u.validate(req, schema);
  // Requires authorization or looking at a public league
  return sequelize.transaction(isoOption, async (t) => {
    await canUserSeeLeague(t, value.user, value.params.leagueID);
    return Contest.findAll({
      where: {
        LeagueId: value.params.leagueID,
      },
    }, u.tobj(t)).then(u.dv);
  });
}

module.exports = getLeagueContests;