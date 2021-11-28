const Joi = require('joi');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');

const { Offer, Trade } = require('../../../models');

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

async function getUserTrades(req) {
  const value = u.validate(req, schema);

  const allbids = await Trade.findAll({
    include: [{
      model: Offer,
      as: 'bid',
      where: {
        ContestId: value.params.contestID,
        UserId: value.user,
      },
    }],
  }).then(u.dv);
  const allasks = await Trade.findAll({
    include: [{
      model: Offer,
      as: 'ask',
      where: {
        ContestId: value.params.contestID,
        UserId: value.user,
      },
    }],
  }).then(u.dv);
  return allbids.concat(allasks);
}

module.exports = getUserTrades;
