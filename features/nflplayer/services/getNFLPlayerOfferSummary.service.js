const Joi = require('joi');

const u = require('../../util/util');

const sequelize = require('../../../db');
const { canUserSeeLeague } = require('../../util/util.service');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};
const { Offer } = require('../../../models');

const schema = Joi.object({
  user: Joi.number().integer().greater(0).required(),
  params: Joi.object().keys({
    leagueID: Joi.string().alphanum().trim().required(),
    contestID: Joi.string().alphanum().trim().required(),
    nflplayerID: Joi.string().alphanum().trim().required(),
  }).required(),
  body: Joi.object().length(0),
});

function getNFLPlayerOfferSummary(req) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }

  return sequelize.transaction(isoOption, async (t) => {
    await canUserSeeLeague(t, value.user, value.params.leagueID);
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
    }, u.tobj(t));
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
    }, u.tobj(t));

    return Promise.all([bids, asks]).then(u.dv);
  });
}

module.exports = getNFLPlayerOfferSummary;
