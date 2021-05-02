const Joi = require('joi');

const u = require('../../util/util');

const sequelize = require('../../../db');
const { Entry, User } = require('../../../models');
const { canUserSeeLeague } = require('../../util/util.service');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: Joi.number().integer().greater(0).required(),
  params: Joi.object().keys({
    leagueID: Joi.number().required(),
    contestID: Joi.number().required(),
  }).required(),
  body: Joi.object().length(0),
});

// Get info for a specific contest
function getContestEntries(req) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }

  // Only show a specific contest's data if user is in contest's league
  return sequelize.transaction(isoOption, async (t) => {
    const theleague = await canUserSeeLeague(t, value.user, value.params.leagueID);
    const includeObj = (theleague.ispublic ? {} : { model: User });
    return Entry.findAll({ where: { ContestId: value.params.contestID }, includeObj });
  });
}

module.exports = getContestEntries;
