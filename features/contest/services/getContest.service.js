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
    leagueID: Joi.string().alphanum().trim().required(),
    contestID: Joi.string().alphanum().trim().required(),
  }).required(),
  body: Joi.object().length(0),
});

// Get info for a specific contest
function getContest(req) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }
  // Requires authorization or looking at a public league
  return sequelize.transaction(isoOption, async (t) => {
    const theleague = await canUserSeeLeague(t, value.user, value.params.leagueID);
    if (!theleague) { u.Error('No league found', 404); }
    return Contest.findByPk(value.params.contestID, u.tobj(t));
  });
}

module.exports = getContest;
