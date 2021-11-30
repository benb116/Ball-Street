const Joi = require('joi');

const u = require('../../util/util');

const { validators } = require('../../util/util.schema');
const getEntryRank = require('../../entry/services/getEntryRank.service');
const { Contest } = require('../../../models');

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

// Get info for a specific contest
async function getContest(req) {
  const value = u.validate(req, schema);
  const thecontest = await Contest.findByPk(value.params.contestID).then(u.dv);
  if (!thecontest) { u.Error('No contest found', 404); }
  const theentry = await getEntryRank(value).catch(() => ({
    rank: null,
    pointtotal: null,
  }));
  thecontest.entry = {};
  thecontest.entry.rank = theentry.rank;
  thecontest.entry.pointtotal = theentry.pointtotal;
  return thecontest;
}

module.exports = getContest;
