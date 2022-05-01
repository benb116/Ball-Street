import Joi from 'joi';

import {
  dv, validate, uError, tobj,
} from '../../util/util';
import validators from '../../util/util.schema';
import errorHandler, { ServiceInput } from '../../util/util.service';

import sequelize from '../../../db';
import LedgerEntry, { LedgerEntryCreateType, LedgerEntryType } from '../../ledger/ledgerEntry.model';
import { LedgerKinds } from '../../../config';
import User from '../user.model';

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: validators.user,
  params: validators.noObj,
  body: {
    amount: Joi.number().integer().greater(0).required()
      .messages({
        'number.base': 'Deposit amount is invalid',
        'number.integer': 'Deposit amount is invalid',
        'number.greater': 'Deposit amount must be positive',
        'any.required': 'Deposit amount is invalid',
      }),
  },
});

interface DepositInput extends ServiceInput {
  params: Record<string, never>,
  body: {
    amount: number,
  }
}

// Create an entry in a contest
async function deposit(req: DepositInput) {
  const value: DepositInput = validate(req, schema);

  return sequelize.transaction(isoOption, async (t) => {
    // Confirm contest is valid and for the current week

    const theuser = await User.findOne({ where: { id: value.user }, ...tobj(t) });
    if (!theuser) return uError('No user found', 404);
    const userValue = dv(theuser);

    theuser.set({
      cash: (userValue.cash + value.body.amount),
    });
    theuser.save({ transaction: t });

    const ledgerObj: LedgerEntryCreateType = {
      UserId: value.user,
      ContestId: null,
      LedgerKindId: LedgerKinds.Deposit.id,
      value: value.body.amount,
    };

    const out: LedgerEntryType = await LedgerEntry.create(ledgerObj, tobj(t)).then(dv);

    return out;
  })
    .catch(errorHandler({
      default: { message: 'Deposit could not be completed', status: 500 },
    }));
}

export default deposit;
