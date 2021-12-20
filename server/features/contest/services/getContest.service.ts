import Joi from 'joi';

import { validate, dv, uError } from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';

import getEntryRank from '../../entry/services/getEntryRank.service';

import Contest, { ContestType } from '../contest.model';

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
  const value: GetContestInput = validate(req, schema);
  const thecontest: ContestType = await Contest.findByPk(value.params.contestID).then(dv);
  if (!thecontest) { uError('No contest found', 404); }
  const theentry = await getEntryRank(value).catch(() => ({
    rank: null,
    pointtotal: null,
  }));
  return { ...thecontest, entry: { rank: theentry.rank, pointtotal: theentry.pointtotal } };
}

export default getContest;
