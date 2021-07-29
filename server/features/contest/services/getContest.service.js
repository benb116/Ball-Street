const Joi = require('joi');

const u = require('../../util/util');

const sequelize = require('../../../db');
const { canUserSeeContest } = require('../../util/util.service');
const { validators } = require('../../util/util.schema');
const getEntryRank = require('../../entry/services/getEntryRank.service');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    leagueID: validators.leagueIDOptional,
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

// Get info for a specific contest
function getContest(req) {
  const value = u.validate(req, schema);
  // Requires authorization or looking at a public league
  return sequelize.transaction(isoOption,
    async (t) => {
      const [, thecontest] = await canUserSeeContest(
        t, value.user, value.params.leagueID, value.params.contestID,
      );
      const theentry = await getEntryRank(value).catch(() => ({
        rank: null,
        pointtotal: null,
      }));
      thecontest.entry = {};
      thecontest.entry.rank = theentry.rank;
      thecontest.entry.pointtotal = theentry.pointtotal;
      return thecontest;
    });
}

module.exports = getContest;
