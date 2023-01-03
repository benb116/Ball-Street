import Joi from 'joi';
import { Op } from 'sequelize';

import { isUError, validate } from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';
import Entry from '../entry.model';

import getEntry from './getEntry.service';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

interface GetEntryRankInput extends ServiceInput {
  params: {
    contestID: number,
  },
  body: Record<string, never>
}

/** Get an entry's rank within a contest */
async function getEntryRank(req: GetEntryRankInput) {
  const value: GetEntryRankInput = validate(req, schema);

  const theentry = await getEntry(value);
  if (isUError(theentry)) throw theentry;
  // Count entries with greater point total, then add one
  // If there are three greater, rank is 4
  const greaterEntries = await Entry.count({
    where: {
      ContestId: value.params.contestID,
      pointtotal: {
        [Op.gt]: theentry.pointtotal,
      },
    },
  }).catch(() => -1);
  return { ...theentry.get(), rank: greaterEntries + 1 };
}

export default getEntryRank;
