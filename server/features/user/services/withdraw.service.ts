import Joi from 'joi';

import { DepositWithdrawInput } from '../../../../types/api/account.api';
import { ledgerKinds } from '../../../../types/rosterinfo';
import sequelize from '../../../db';
import LedgerEntry from '../../ledger/ledgerEntry.model';
import { validate, uError, tobj } from '../../util/util';
import validators from '../../util/util.schema';
import errorHandler, { ServiceInput } from '../../util/util.service';
import User from '../user.model';

import type { DepositWithdrawType, LedgerEntryType } from '../../../../types/api/account.api';

const bodySchema = Joi.object<DepositWithdrawType>({
  amount: Joi.number().integer().greater(0).required()
    .messages({
      'number.base': 'Withdrawal amount is invalid',
      'number.integer': 'Withdrawal amount is invalid',
      'number.greater': 'Withdrawal amount must be positive',
      'any.required': 'Withdrawal amount is invalid',
    }),
});
validate(DepositWithdrawInput, bodySchema);
const schema = Joi.object<WithdrawalInput>({
  user: validators.user,
  params: validators.noObj,
  body: bodySchema,
});

interface WithdrawalInput extends ServiceInput {
  params: Record<string, never>,
  body: DepositWithdrawType
}

/** Create an entry in a contest */
async function withdraw(req: WithdrawalInput): Promise<LedgerEntryType> {
  const value = validate(req, schema);

  return sequelize.transaction(async (t) => {
    // Confirm contest is valid and for the current week

    const theuser = await User.findOne({ where: { id: value.user }, ...tobj(t) });
    if (!theuser) throw uError('No user found', 404);
    if (theuser.cash < value.body.amount) throw uError('User has insufficient funds', 402);

    theuser.cash -= value.body.amount;
    theuser.save({ transaction: t });

    const ledgerObj = {
      UserId: value.user,
      ContestId: null,
      LedgerKindId: ledgerKinds.Withdrawal.id,
      value: value.body.amount,
    };

    return LedgerEntry.create(ledgerObj, tobj(t));
  })
    .catch(errorHandler({
      default: { message: 'Withdrawal could not be completed', status: 500 },
    }));
}

export default withdraw;
