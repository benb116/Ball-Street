const Joi = require('joi');

const u = require('../../util/util');

const sequelize = require('../../../db');
const { Contest } = require('../../../models');
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

function getLeagueContests(req) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }
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
