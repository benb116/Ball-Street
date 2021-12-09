import Joi from 'joi';

import { validate } from '../../util/util';

import { Entry } from '../../../models';
import errorHandler, { ServiceInput } from '../../util/util.service';
import validators from '../../util/util.schema';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

interface GetContestEntriesInput extends ServiceInput {
  params: {
    contestID: number,
  },
  body: Record<string, never>
}

// Get info for a specific contest
function getContestEntries(req: GetContestEntriesInput) {
  const value: GetContestEntriesInput = validate(req, schema);

  return Entry.findAll({ where: { ContestId: value.params.contestID } })
    .catch(errorHandler({
      default: { message: 'Entries could not be retrieved', status: 500 },
    }));
}

export default getContestEntries;
