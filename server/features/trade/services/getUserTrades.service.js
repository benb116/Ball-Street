const Joi = require('joi');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');

const { Offer, Trade, User } = require('../../../models');

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    leagueID: validators.leagueIDOptional,
    contestID: validators.contestID,
  }).required(),
  body: Joi.object().keys({
    offerobj: Joi.object().required().messages({
      'object.base': 'Offer is invalid',
      'any.required': 'Please specify the offer details',
    }),
  }).required(),
});

function getUserTrades(req) {
  const value = u.validate(req, schema);

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
