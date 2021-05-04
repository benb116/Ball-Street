const Joi = require('joi');

const validators = {};

validators.user = Joi.number().integer().greater(0).required();

validators.leagueIDOptional = Joi.number().optional();
validators.leagueID = Joi.number().integer().required().messages({
  'number.base': 'League ID is invalid',
  'number.integer': 'League ID is invalid',
  'any.required': 'Please specify a league',
});
validators.contestID = Joi.number().integer().required().messages({
  'number.base': 'Contest ID is invalid',
  'number.integer': 'Contest ID is invalid',
  'any.required': 'Please specify a contest',
});
validators.nflplayerID = Joi.number().integer().required().messages({
  'number.base': 'Player ID is invalid',
  'number.integer': 'Player ID is invalid',
  'any.required': 'Please specify a player',
});

validators.noObj = Joi.object().length(0);

module.exports = {
  validators,
};
