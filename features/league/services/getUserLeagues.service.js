const Joi = require('joi');

const u = require('../../util/util');

const { Membership, League } = require('../../../models');

const schema = Joi.object({
  user: Joi.number().integer().greater(0).required(),
  params: Joi.object().length(0),
  body: Joi.object().length(0),
});

// Get info for a specific contest
function getUserLeagues(req) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }
  console.log(value);
  return Membership.findAll({
    where: { UserId: value.user },
    include: { model: League },
  }).then(u.dv).then((ships) => ships.map((m) => m.League));
}

module.exports = getUserLeagues;
