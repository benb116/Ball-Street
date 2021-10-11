const Joi = require('joi');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');

const { NFLPlayer } = require('../../../models');

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    nflplayerID: validators.nflplayerID,
  }).required(),
  body: validators.noObj,
});

async function getNFLPlayer(req) {
  const value = u.validate(req, schema);

  const theplayer = await NFLPlayer.findOne({
    where: {
      id: value.params.nflplayerID,
      active: true,
    },
  }).then(u.dv);
  if (!theplayer) { u.Error('No player found', 404); }
  return theplayer;
}

module.exports = getNFLPlayer;
