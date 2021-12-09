import Joi from 'joi';

import { validate, dv, uError } from '../../util/util';

import { Contest } from '../../../models';
import validators from '../../util/util.schema';
import getEntryRank from '../../entry/services/getEntryRank.service';
import { ServiceInput } from '../../util/util.service';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

interface GetContestInput extends ServiceInput {
  params: {
    contestID: number,
  },
  body: Record<string, never>
}
// Get info for a specific contest
async function getContest(req: GetContestInput) {
  const value = validate(req, schema);
  const thecontest = await Contest.findByPk(value.params.contestID).then(dv);
  if (!thecontest) { uError('No contest found', 404); }
  const theentry = await getEntryRank(value).catch(() => ({
    rank: null,
    pointtotal: null,
  }));
  thecontest.entry = {};
  thecontest.entry.rank = theentry.rank;
  thecontest.entry.pointtotal = theentry.pointtotal;
  return thecontest;
}

export default getContest;
