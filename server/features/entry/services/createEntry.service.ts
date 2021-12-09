import Joi from 'joi';

import { dv, validate, uError } from '../../util/util';

import { Entry, Contest } from '../../../models';
import errorHandler, { ServiceInput } from '../../util/util.service';
import validators from '../../util/util.schema';

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

// Get info for a specific contest
async function createEntry(req: CreateEntryInput) {
  const value = validate(req, schema);

  const thecontest = await Contest.findByPk(value.params.contestID).then(dv);
  if (!thecontest) { uError('No contest found', 404); }
  const theweek = Number(process.env.WEEK);
  if (theweek !== thecontest.nflweek) uError('Incorrect week', 406);

  const obj = {
    UserId: value.user,
    ContestId: value.params.contestID,
    pointtotal: thecontest.budget,
  };
  return Entry.create(obj).then(dv)
    .catch(errorHandler({
      default: { message: 'Entry could not be created', status: 500 },
      Entries_pkey: { message: 'An entry already exists', status: 406 },
    }));
}

export default createEntry;
