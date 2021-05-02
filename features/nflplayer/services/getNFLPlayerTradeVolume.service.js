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
    leagueID: Joi.number().required(),
    contestID: Joi.number().required(),
    nflplayerID: Joi.number().required(),
  }).required(),
  body: Joi.object().length(0),
});

function getNFLPlayerTradeVolume(req) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }

  return sequelize.transaction(isoOption, async (t) => {
    await canUserSeeLeague(t, value.user, value.params.leagueID);
    return Offer.count({
      where: {
        ContestId: value.params.contestID,
        NFLPlayerId: value.params.nflplayerID,
      },
    }, u.tobj(t)).then(u.dv).then((out) => out / 2);
  });
}

module.exports = getNFLPlayerTradeVolume;
