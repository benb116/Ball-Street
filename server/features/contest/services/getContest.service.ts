import Joi from 'joi';

import { validate, uError } from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';

import getEntryRank from '../../entry/services/getEntryRank.service';

import Contest from '../contest.model';
import type { ContestWithEntryType } from '../../../../types/api/contest.api';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({ contestID: validators.contestID }).required(),
  body: validators.noObj,
});

interface GetContestInput extends ServiceInput {
  params: { contestID: number },
  body: Record<string, never>
}

/** Get info for a specific contest */
async function getContest(req: GetContestInput): Promise<ContestWithEntryType> {
  const value: GetContestInput = validate(req, schema);
  const thecontest = await Contest.findByPk(value.params.contestID);
  if (!thecontest) { throw uError('No contest found', 404); }

  // Also pull a user's entry rank in this contest (if it exists)
  const theentry = await getEntryRank(value).catch(() => ({
    rank: 0,
    pointtotal: 0,
  }));
  return {
    ...thecontest.toJSON(),
    entry: {
      UserId: value.user,
      rank: theentry.rank,
      pointtotal: theentry.pointtotal,
    },
  };
}

export default getContest;
