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
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

// Get info for a specific contest
function getContest(req) {
  const value = u.validate(req, schema);
  // Requires authorization or looking at a public league
  return sequelize.transaction(isoOption, async (t) => {
    const theleague = await canUserSeeLeague(t, value.user, value.params.leagueID);
    if (!theleague) { u.Error('No league found', 404); }
    const thecontest = await Contest.findByPk(value.params.contestID, u.tobj(t)).then(u.dv);
    if (!thecontest) { u.Error('No contest found', 404); }
    if (thecontest.LeagueId !== value.params.leagueID) { u.Error('Contest and league do not match', 406); }
    return thecontest;
  });
}

module.exports = getContest;
