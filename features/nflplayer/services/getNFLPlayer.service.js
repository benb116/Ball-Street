const Joi = require('joi');

const u = require('../../util/util');

const { NFLPlayer } = require('../../../models');

const schema = Joi.object({
  user: Joi.number().integer().greater(0).required(),
  params: Joi.object().keys({
    nflplayerID: Joi.number().required(),
  }).required(),
  body: Joi.object().length(0),
});

function getNFLPlayer(req) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }

  return NFLPlayer.findOne({ where: { NFLPlayerId: value.params.nflplayerID } }).then(u.dv);
}

module.exports = getNFLPlayer;
