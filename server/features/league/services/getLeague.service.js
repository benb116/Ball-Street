const Joi = require('joi');

const u = require('../../util/util');

const { canUserSeeLeague } = require('../../util/util.service');
const { validators } = require('../../util/util.schema');

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    leagueID: validators.leagueID,
  }).required(),
  body: validators.noObj,
});

// Get info for a specific contest
async function getLeague(req) {
  const value = u.validate(req, schema);

  return canUserSeeLeague(0, value.user, value.params.leagueID);
}

module.exports = getLeague;
