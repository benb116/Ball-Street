const Joi = require('joi');

const u = require('../../util/util');

const { canUserSeeLeague } = require('../../util/util.service');

const schema = Joi.object({
  user: Joi.number().integer().greater(0).required(),
  params: Joi.object().keys({
    leagueID: Joi.number().required(),
  }).required(),
  body: Joi.object().length(0),
});

// Get info for a specific contest
async function getLeague(req) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }

  return canUserSeeLeague(0, value.user, value.params.leagueID);
}

module.exports = getLeague;
