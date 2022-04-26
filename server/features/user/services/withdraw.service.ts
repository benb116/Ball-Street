import Joi from 'joi';

import {
  dv, validate, uError, tobj,
} from '../../util/util';
import validators from '../../util/util.schema';
import errorHandler, { ServiceInput } from '../../util/util.service';

import sequelize from '../../../db';
import LedgerEntry, { LedgerEntryCreateType, LedgerEntryType } from '../../ledger/ledgerEntry.model';
import { LedgerKindTypes } from '../../../config';
import User from '../user.model';
import LedgerKind from '../../ledger/ledgerKind.model';
import { SendWithdrawEmail } from '../../../utilities/email';

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: validators.user,
  params: validators.noObj,
  body: {
    amount: Joi.number().integer().greater(0).required()
      .messages({
        'number.base': 'Withdrawal amount is invalid',
        'number.integer': 'Withdrawal amount is invalid',
        'number.greater': 'Withdrawal amount must be positive',
        'any.required': 'Withdrawal amount is invalid',
      }),
  },
});

interface WithdrawalInput extends ServiceInput {
  params: Record<string, never>,
  body: {
    amount: number,
  }
}

// Create an entry in a contest
async function withdraw(req: WithdrawalInput) {
  const value: WithdrawalInput = validate(req, schema);

  return sequelize.transaction(isoOption, async (t) => {
    const theuser = await User.findOne({ where: { id: value.user }, ...tobj(t) });
    if (!theuser) return uError('No user found', 404);
    const userValue = dv(theuser);
    if (userValue.cash < value.body.amount) uError('User has insufficient funds', 402);

    theuser.set({
      cash: (userValue.cash - value.body.amount),
    });
    theuser.save({ transaction: t });

    const ledgerObj: LedgerEntryCreateType = {
      UserId: value.user,
      ContestId: null,
      LedgerKindId: LedgerKindTypes.Withdrawal.id,
      value: value.body.amount,
    };

    const out: LedgerEntryType = await LedgerEntry.create(ledgerObj, tobj(t)).then(dv);
    SendWithdrawEmail(userValue.email, out.id);

    return LedgerEntry.findByPk(out.id, {
      include: [{ model: LedgerKind }, { model: User }],
      transaction: t,
    }).then(dv);
  })
    .catch(errorHandler({
      default: { message: 'Withdrawal could not be completed', status: 500 },
    }));
}

export default withdraw;
