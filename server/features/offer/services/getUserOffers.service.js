const Joi = require('joi');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');

const { Offer } = require('../../../models');

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    leagueID: validators.leagueIDOptional,
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
    .catch((err) => {
      if (err.status) { u.Error(err.message, err.status); }
      const errmess = err.parent.constraint || err[0].message;
      u.Error(errmess, 406);
    });
}

module.exports = getUserOffers;
