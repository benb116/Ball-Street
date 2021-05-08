const Joi = require('joi');

const validators = {};

validators.email = Joi.string().email().required().messages({
  'string.base': 'Email is invalid',
  'string.email': 'Email is invalid',
  'any.required': 'Email is required',
});

validators.password = Joi.string().min(8).required().messages({
  'string.base': 'Password is invalid',
  'string.min': 'Password must be at least 8 characters long',
  'any.required': 'Password is required',
});

validators.user = Joi.number().integer().greater(0).required()
  .messages({
    'number.base': 'User ID is invalid',
    'number.integer': 'User ID is invalid',
    'number.greater': 'User ID is invalid',
    'any.required': 'You must be logged in',
  });

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
