import Joi from 'joi'

import { dv, tobj, validate, uError } from '../../util/util'
import validators from '../../util/util.schema'

import { Offer } from '../../../models'
import { errorHandler } from '../../util/util.service'

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

function getUserOffers(req) {
  const value = validate(req, schema);
  return Offer.findAll({
    where: {
      UserId: value.user,
      ContestId: value.params.contestID,
      filled: false,
      cancelled: false,
    },
  }).then(dv)
    .catch(errorHandler({
      default: ['Cannot retrieve offers', 500],
    }));
}

export default getUserOffers;
