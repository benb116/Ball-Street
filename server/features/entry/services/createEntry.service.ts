import Joi from 'joi';

import { validate, uError, tobj } from '@util/util';
import validators from '@util/util.schema';
import errorHandler, { ServiceInput } from '@util/util.service';

import Contest from '@features/contest/contest.model';
import sequelize from '@db';
import User from '@features/user/user.model';
import LedgerEntry from '@features/ledger/ledgerEntry.model';
import { LedgerKinds } from '@server/config';
import Entry from '../entry.model';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

interface CreateEntryInput extends ServiceInput {
  params: {
    contestID: number,
  },
  body: Record<string, never>
}

// Create an entry in a contest
async function createEntry(req: CreateEntryInput) {
  const value: CreateEntryInput = validate(req, schema);

  return sequelize.transaction(async (t) => {
    // Confirm contest is valid and for the current week
    const thecontest = await Contest.findByPk(value.params.contestID);
    if (!thecontest) { return uError('No contest found', 404); }
    const theweek = Number(process.env.WEEK);
    if (theweek !== thecontest.nflweek) return uError('Incorrect week', 406);

    const theuser = await User.findOne({ where: { id: value.user }, ...tobj(t) });
    if (!theuser) return uError('No user found', 404);

    if (theuser.cash < thecontest.buyin) return uError('User has insufficient funds', 402);

    theuser.cash -= thecontest.buyin;
    theuser.save({ transaction: t });

    const ledgerObj = {
      UserId: value.user,
      ContestId: thecontest.id,
      LedgerKindId: LedgerKinds['Entry Fee'].id,
      value: thecontest.buyin,
    };

    await LedgerEntry.create(ledgerObj, tobj(t));

    const entryObj = {
      UserId: value.user,
      ContestId: value.params.contestID,
      pointtotal: thecontest.budget,
    };
    return Entry.create(entryObj, tobj(t));
  })
    .catch(errorHandler({
      default: { message: 'Entry could not be created', status: 500 },
      Entries_pkey: { message: 'An entry already exists', status: 406 },
    }));
}

export default createEntry;
