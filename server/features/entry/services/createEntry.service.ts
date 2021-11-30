import Joi from 'joi';

import { dv, validate, uError } from '../../util/util';

import { Entry, Contest } from '../../../models';
import { errorHandler } from '../../util/util.service';
import validators from '../../util/util.schema';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

// Get info for a specific contest
async function createEntry(req) {
  const value = validate(req, schema);

  const obj = {};
  obj.UserId = value.user;
  obj.ContestId = value.params.contestID;
  const thecontest = await Contest.findByPk(value.params.contestID).then(dv);
  if (!thecontest) { uError('No contest found', 404); }
  const theweek = Number(process.env.WEEK);
  if (theweek !== thecontest.nflweek) uError('Incorrect week', 406);
  obj.pointtotal = thecontest.budget;
  return Entry.create(obj).then(dv)
    .catch(errorHandler({
      default: ['Entry could not be created', 500],
      Entries_pkey: ['An entry already exists', 406],
    }));
}

export default createEntry;