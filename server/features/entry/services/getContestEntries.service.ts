const Joi = require('joi');

const u = require('../../util/util');

const { Entry } = require('../../../models');
const { errorHandler } = require('../../util/util.service');
const { validators } = require('../../util/util.schema');

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

// Get info for a specific contest
function getContestEntries(req) {
  const value = u.validate(req, schema);

  return Entry.findAll({ where: { ContestId: value.params.contestID } })
    .catch(errorHandler({
      default: ['Entries could not be retrieved', 500],
    }));
}

module.exports = getContestEntries;
