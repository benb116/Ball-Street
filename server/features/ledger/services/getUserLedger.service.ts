import Joi from 'joi';

import { dv, validate } from '../../util/util';
import validators from '../../util/util.schema';
import errorHandler, { ServiceInput } from '../../util/util.service';
import LedgerEntry from '../ledgerEntry.model';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    page: Joi.number().integer().greater(0).optional()
      .messages({
        'number.base': 'page is invalid',
        'number.integer': 'page is invalid',
        'number.greater': 'page is invalid',
      }),
  }).required(),
  body: validators.noObj,
});

interface GetUserLedgerInput extends ServiceInput {
  params: {
    page?: number
  },
  body: Record<string, never>
}

const paginationLimit = 10;

function getUserLedger(req: GetUserLedgerInput) {
  const value: GetUserLedgerInput = validate(req, schema);
  return LedgerEntry.findAll({
    where: { UserId: value.user },
    order: [['createdAt', 'DESC']],
    limit: paginationLimit,
    offset: paginationLimit * ((value.params.page || 1) - 1),
  }).then(dv)
    .catch(errorHandler({
      default: { message: 'Cannot retrieve transactions', status: 500 },
    }));
}

export default getUserLedger;
