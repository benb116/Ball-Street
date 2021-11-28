const { Op } = require('sequelize');
const Joi = require('joi');

const u = require('../../util/util');
const config = require('../../../config');

const { validators } = require('../../util/util.schema');

const { Entry } = require('../../../models');

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
    nflplayerID: validators.nflplayerID,
  }).required(),
  body: validators.noObj,
});

function getNFLPlayerNumAdds(req) {
  const value = u.validate(req, schema);

  return Entry.count({
    where: {
      ContestId: value.params.contestID,
      [Op.or]: gen(value.params.nflplayerID),
    },
  }).then(u.dv);

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
