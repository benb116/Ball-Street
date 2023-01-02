import Joi from 'joi';

import { validate, uError, tobj } from '../../util/util';
import validators from '../../util/util.schema';
import errorHandler, { ServiceInput } from '../../util/util.service';

import sequelize from '../../../db';
import LedgerEntry from '../../ledger/ledgerEntry.model';
import { ledgerKinds } from '../../../config';
import User from '../user.model';

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

/** Create an entry in a contest */
async function deposit(req: DepositInput) {
  const value: DepositInput = validate(req, schema);

  return sequelize.transaction(async (t) => {
    // Confirm contest is valid and for the current week

    const theuser = await User.findOne({ where: { id: value.user }, ...tobj(t) });
    if (!theuser) throw uError('No user found', 404);

    theuser.cash += value.body.amount;
    theuser.save({ transaction: t });

    const ledgerObj = {
      UserId: value.user,
      ContestId: null,
      LedgerKindId: ledgerKinds.Deposit.id,
      value: value.body.amount,
    };

    return LedgerEntry.create(ledgerObj, tobj(t));
  })
    .catch(errorHandler({
      default: { message: 'Deposit could not be completed', status: 500 },
    }));
}

export default deposit;
