import Joi from 'joi';

import {
  dv, validate, uError, tobj,
} from '../../util/util';
import validators from '../../util/util.schema';
import errorHandler, { ServiceInput } from '../../util/util.service';

import Contest from '../../contest/contest.model';
import Entry, { EntryCreateType } from '../entry.model';
import sequelize from '../../../db';
import User from '../../user/user.model';

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

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

  return sequelize.transaction(isoOption, async (t) => {
    // Confirm contest is valid and for the current week
    const thecontest = await Contest.findByPk(value.params.contestID).then(dv);
    if (!thecontest) { uError('No contest found', 404); }
    const theweek = Number(process.env.WEEK);
    if (theweek !== thecontest.nflweek) uError('Incorrect week', 406);

    const theuser = await User.findOne({ where: { id: value.user }, ...tobj(t) });
    if (!theuser) return uError('No user found', 404);
    const userValue = dv(theuser);

    if (userValue.cash < thecontest.buyin) uError('User has insufficient funds', 402);

    theuser.set({
      cash: (userValue.cash - thecontest.buyin),
    });
    theuser.save({ transaction: t });

    const obj: EntryCreateType = {
      UserId: value.user,
      ContestId: value.params.contestID,
      pointtotal: thecontest.budget,
    };
    return Entry.create(obj, tobj(t));
  })
    .catch(errorHandler({
      default: { message: 'Entry could not be created', status: 500 },
      Entries_pkey: { message: 'An entry already exists', status: 406 },
    }));
}

export default createEntry;
