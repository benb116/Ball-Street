const { Op } = require('sequelize');
const Joi = require('joi');

const u = require('../../util/util');

const getEntry = require('./getEntry.service');
const { validators } = require('../../util/util.schema');
const { Entry } = require('../../../models');

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    leagueID: validators.leagueIDOptional,
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

// Get an entry's rank within a contest
async function getEntryRank(req) {
  const value = u.validate(req, schema);
  // Requires authorization or looking at a public league
  const theentry = await getEntry(value);

  // Count entries with greater point total, then add one
  // If there are three greater, rank is 4
  const greaterEntries = await Entry.count({
    where: {
      ContestId: value.params.contestID,
      pointtotal: {
        [Op.gt]: theentry.pointtotal,
      },
    },
  }).then(u.dv);
  theentry.rank = greaterEntries + 1;
  return theentry;
}

module.exports = getEntryRank;
