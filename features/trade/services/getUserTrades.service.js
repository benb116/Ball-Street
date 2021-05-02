const Joi = require('joi');

const u = require('../../util/util');

const { Offer, Trade, User } = require('../../../models');

const schema = Joi.object({
  user: Joi.number().integer().greater(0).required(),
  params: Joi.object().keys({
    leagueID: Joi.number().optional(),
    contestID: Joi.number().required(),
  }).required(),
  body: Joi.object().keys({
    offerobj: Joi.object().required(),
  }).required(),
});

function getUserTrades(req) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }

  return Trade.findAll({
    include: [
      {
        model: User,
        where: {
          id: value.user,
        },
      },
      {
        model: Offer,
        where: {
          ContestId: value.params.contestID,
        },
      },
    ],
  }).then(u.dv);
}

module.exports = getUserTrades;
