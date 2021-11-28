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

function getNFLPlayerTradeVolume(req) {
  const value = u.validate(req, schema);

  return Offer.count({
    where: {
      ContestId: value.params.contestID,
      NFLPlayerId: value.params.nflplayerID,
    },
  }).then(u.dv).then((out) => out / 2);
}

module.exports = getNFLPlayerTradeVolume;
