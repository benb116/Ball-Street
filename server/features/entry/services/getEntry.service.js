const Joi = require('joi');

const u = require('../../util/util');

const { Entry } = require('../../../models');
const { validators } = require('../../util/util.schema');

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

// Get info for a specific contest
async function getEntry(req) {
  const value = u.validate(req, schema);
  const theentry = await Entry.findOne({
    where: {
      UserId: value.user,
      ContestId: value.params.contestID,
    },
  }).then(u.dv);
  if (!theentry) { u.Error('No entry found', 404); }
  return theentry;
}

module.exports = getEntry;
