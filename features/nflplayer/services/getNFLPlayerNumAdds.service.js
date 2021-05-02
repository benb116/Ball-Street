const { Op } = require('sequelize');
const Joi = require('joi');

const u = require('../../util/util');
const config = require('../../../config');

const sequelize = require('../../../db');
const { canUserSeeLeague } = require('../../util/util.service');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};
const { Entry } = require('../../../models');

const schema = Joi.object({
  user: Joi.number().integer().greater(0).required(),
  params: Joi.object().keys({
    leagueID: Joi.number().required(),
    contestID: Joi.number().required(),
    nflplayerID: Joi.number().required(),
  }).required(),
  body: Joi.object().length(0),
});

function getNFLPlayerNumAdds(req) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }

  return sequelize.transaction(isoOption, async (t) => {
    await canUserSeeLeague(t, value.user, value.params.leagueID);
    return Entry.count({
      where: {
        ContestId: value.params.contestID,
        [Op.or]: gen(value.params.nflplayerID),
      },
    }, u.tobj(t)).then(u.dv);
  });

  function gen(_player) {
    const rpos = Object.keys(config.Roster);
    return rpos.map((r) => {
      const out = {};
      out[r] = _player;
      return out;
    });
  }
}

module.exports = getNFLPlayerNumAdds;
