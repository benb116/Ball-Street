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

function getNFLPlayer(req) {
  const value = u.validate(req, schema);

  return NFLPlayer.findOne({ where: { NFLPlayerId: value.params.nflplayerID } }).then(u.dv);
}

module.exports = getNFLPlayer;
