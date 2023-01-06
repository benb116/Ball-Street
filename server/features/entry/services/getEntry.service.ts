import Joi from 'joi';

import { EntryType } from '../../../../types/api/entry.api';
import { validate, uError } from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';
import Entry from '../entry.model';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({ contestID: validators.contestID }).required(),
  body: validators.noObj,
});

interface GetEntryInput extends ServiceInput {
  params: { contestID: number },
  body: Record<string, never>
}

/** Get info for a specific entry */
async function getEntry(req: GetEntryInput): Promise<EntryType> {
  const value: GetEntryInput = validate(req, schema);

  const theentry = await Entry.findOne({
    where: {
      UserId: value.user,
      ContestId: value.params.contestID,
    },
  });
  if (!theentry) { throw uError('No entry found', 404); }
  return theentry.toJSON();
}

export default getEntry;
