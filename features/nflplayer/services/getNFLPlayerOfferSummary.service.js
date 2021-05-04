const Joi = require('joi');

const u = require('../../util/util');

const sequelize = require('../../../db');
const { canUserSeeLeague } = require('../../util/util.service');
const { validators } = require('../../util/util.schema');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};
const { Offer } = require('../../../models');

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    leagueID: validators.leagueID,
    contestID: validators.contestID,
    nflplayerID: validators.nflplayerID,
  }).required(),
  body: validators.noObj,
});

function getNFLPlayerOfferSummary(req) {
  const value = u.validate(req, schema);

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
