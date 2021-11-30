import Joi from 'joi'

import { validate } from '../../util/util'

import { Entry } from '../../../models'
import { errorHandler } from '../../util/util.service'
import validators from '../../util/util.schema'

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

// Get info for a specific contest
function getContestEntries(req) {
  const value = validate(req, schema);

  return Entry.findAll({ where: { ContestId: value.params.contestID } })
    .catch(errorHandler({
      default: ['Entries could not be retrieved', 500],
    }));
}

export default getContestEntries;
