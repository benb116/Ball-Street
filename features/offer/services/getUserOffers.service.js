const Joi = require('joi');

const u = require('../../util/util');

const { Offer } = require('../../../models');

const schema = Joi.object({
  user: Joi.number().integer().greater(0).required(),
  params: Joi.object().keys({
    leagueID: Joi.string().alphanum().trim().optional(),
    contestID: Joi.string().alphanum().trim().required(),
  }).required(),
  body: Joi.object().length(0),
});

function getUserOffers(req) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }

  return Offer.findAll({
    where: {
      UserId: value.user,
      ContestId: value.params.contestID,
      filled: false,
      cancelled: false,
    },
  }).then(u.dv).catch(u.Error);
}

module.exports = getUserOffers;
