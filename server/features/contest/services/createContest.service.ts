import Joi from 'joi';

import { validate } from '../../util/util';
import validators from '../../util/util.schema';
import errorHandler, { ServiceInput } from '../../util/util.service';
import Contest from '../contest.model';

import type { ContestItemType } from '../../../../types/api/contest.api';

const schema = Joi.object<CreateContestInput>({
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
    buyin: Joi.number().integer().greater(0).optional()
      .default(0)
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
    buyin: number,
  }
}

/** Create a new contest (to be used by admin) */
async function createContest(req: CreateContestInput): Promise<ContestItemType> {
  const value = validate(req, schema);
  const contestObj = {
    name: value.body.name,
    nflweek: Number(process.env['WEEK']),
    budget: value.body.budget,
    buyin: value.body.buyin,
  };
  return Contest.create(contestObj).catch(errorHandler({
    default: { message: 'Contest could not be created', status: 500 },
  }));
}

export default createContest;
