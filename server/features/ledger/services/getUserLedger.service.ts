import Joi from 'joi';

import { LedgerEntryJoinedKindType } from '../../../../types/api/account.api';
import { validate } from '../../util/util';
import validators from '../../util/util.schema';
import errorHandler, { ServiceInput } from '../../util/util.service';
import LedgerEntry from '../ledgerEntry.model';
import LedgerKind from '../ledgerKind.model';

const schema = Joi.object<GetUserLedgerInput>({
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

// Number of entries per page
const paginationLimit = 10;

/** Show the recent ledger entries for a user */
function getUserLedger(req: GetUserLedgerInput): Promise<LedgerEntryJoinedKindType[]> {
  const value = validate(req, schema);
  return LedgerEntry.findAll({
    where: { UserId: value.user },
    order: [['createdAt', 'DESC']],
    limit: paginationLimit,
    offset: paginationLimit * ((value.params.page || 1) - 1),
    include: [
      { model: LedgerKind },
    ],
  })
    .catch(errorHandler({
      default: { message: 'Cannot retrieve transactions', status: 500 },
    })) as Promise<LedgerEntryJoinedKindType[]>;
}

export default getUserLedger;
