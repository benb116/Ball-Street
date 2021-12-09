import Joi from 'joi';

import { validate } from '../../util/util';

import errorHandler, { ServiceInput } from '../../util/util.service';
import { Contest } from '../../../models';
import validators from '../../util/util.schema';

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

interface CreateContestInput extends ServiceInput {
  params: Record<string, never>,
  body: {
    name: string,
    budget: number,
  }
}

// Get info for a specific contest
async function createContest(req: CreateContestInput) {
  const value: CreateContestInput = validate(req, schema);
  return Contest.create({
    name: value.body.name,
    nflweek: Number(process.env.WEEK),
    budget: value.body.budget,
  }).catch(errorHandler({
    default: { message: 'Contest could not be created', status: 500 },
  }));
}

export default createContest;
