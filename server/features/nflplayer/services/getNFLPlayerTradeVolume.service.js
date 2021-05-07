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

function getNFLPlayerTradeVolume(req) {
  const value = u.validate(req, schema);

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
