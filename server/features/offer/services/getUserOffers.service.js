const Joi = require('joi');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');

const { Offer } = require('../../../models');
const { errorHandler } = require('../../util/util.service');

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

function getUserOffers(req) {
  const value = u.validate(req, schema);
  return Offer.findAll({
    where: {
      UserId: value.user,
      ContestId: value.params.contestID,
      filled: false,
      cancelled: false,
    },
  }).then(u.dv)
    .catch(errorHandler({
      default: ['Cannot retrieve offers', 500],
    }));
}

module.exports = getUserOffers;
