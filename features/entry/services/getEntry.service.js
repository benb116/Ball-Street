const Joi = require('joi');

const u = require('../../util/util');

const { Entry } = require('../../../models');

const schema = Joi.object({
  user: Joi.number().integer().greater(0).required(),
  params: Joi.object().keys({
    leagueID: Joi.number().optional(),
    contestID: Joi.number().required(),
  }).required(),
  body: Joi.object().length(0),
});

// Get info for a specific contest
function getEntry(req) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }

  return Entry.findOne({
    where: {
      UserId: value.user,
      ContestId: value.params.contestID,
    },
  }).then(u.dv);
}

module.exports = getEntry;
