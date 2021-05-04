const Joi = require('joi');

const u = require('../../util/util');

const { Entry } = require('../../../models');
const { validators } = require('../../util/util.schema');

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    leagueID: Joi.number().optional(),
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

// Get info for a specific contest
function getEntry(req) {
  const value = u.validate(req, schema);

  return Entry.findOne({
    where: {
      UserId: value.user,
      ContestId: value.params.contestID,
    },
  }).then(u.dv);
}

module.exports = getEntry;
