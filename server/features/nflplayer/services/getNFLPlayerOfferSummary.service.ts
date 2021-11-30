const Joi = require('joi');

const u = require('../../util/util');

const { validators } = require('../../util/util.schema');

const { Offer } = require('../../../models');

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
    nflplayerID: validators.nflplayerID,
  }).required(),
  body: validators.noObj,
});

function getNFLPlayerOfferSummary(req) {
  const value = u.validate(req, schema);

  const bids = Offer.count({
    group: 'price',
    where: {
      NFLPlayerId: value.params.nflplayerID,
      ContestId: value.params.contestID,
      filled: false,
      cancelled: false,
      isbid: true,
    },
    attributes: ['price'],
  });
  const asks = Offer.count({
    group: 'price',
    where: {
      NFLPlayerId: value.params.nflplayerID,
      ContestId: value.params.contestID,
      filled: false,
      cancelled: false,
      isbid: false,
    },
    attributes: ['price'],
  });

  return Promise.all([bids, asks]).then(u.dv);
}

module.exports = getNFLPlayerOfferSummary;
