import Joi from 'joi'

import { dv, tobj, validate, uError } from '../../util/util'

import { Entry } from '../../../models'
import validators from '../../util/util.schema'

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

// Get info for a specific contest
async function getEntry(req) {
  const value = validate(req, schema);
  const theentry = await Entry.findOne({
    where: {
      UserId: value.user,
      ContestId: value.params.contestID,
    },
  }).then(dv);
  if (!theentry) { uError('No entry found', 404); }
  return theentry;
}

export default getEntry;
