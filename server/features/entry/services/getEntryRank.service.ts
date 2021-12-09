import { Op } from 'sequelize';
import Joi from 'joi';

import { dv, validate } from '../../util/util';

import getEntry from './getEntry.service';
import validators from '../../util/util.schema';
import { Entry } from '../../../models';
import { ServiceInput } from '../../util/util.service';

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

// Get an entry's rank within a contest
async function getEntryRank(req: GetEntryRankInput) {
  const value = validate(req, schema);
  // Requires authorization or looking at a public league
  const theentry = await getEntry(value);

  // Count entries with greater point total, then add one
  // If there are three greater, rank is 4
  const greaterEntries = await Entry.count({
    where: {
      ContestId: value.params.contestID,
      pointtotal: {
        [Op.gt]: theentry.pointtotal,
      },
    },
  }).then(dv).catch(() => -1);
  theentry.rank = greaterEntries + 1;
  return theentry;
}

export default getEntryRank;
