const Joi = require('joi');

const u = require('../../util/util');

const { Contest } = require('../../../models');
const { validators } = require('../../util/util.schema');
const { errorHandler } = require('../../util/util.service');
const { get } = require('../../../db/redis');

const schema = Joi.object({
  user: validators.user,
  params: validators.noObj,
  body: Joi.object().keys({
    name: Joi.string().trim().required().messages({
      'string.base': 'Name is invalid',
      'any.required': 'Please specify a name',
    }),
    budget: Joi.number().integer().greater(0).required()
      .messages({
        'number.base': 'Budget is invalid',
        'number.integer': 'Budget is invalid',
        'number.greater': 'Budget must be greater than 0',
        'any.required': 'Please specify a budget',
      }),
  }).required(),
});

// Get info for a specific contest
async function createContest(req) {
  const value = u.validate(req, schema);
  return Contest.create({
    name: value.body.name,
    nflweek: await get.CurrentWeek(),
    budget: value.body.budget,
  }).catch(errorHandler({
    default: ['Contest could not be created', 500],
  }));
}

module.exports = createContest;
