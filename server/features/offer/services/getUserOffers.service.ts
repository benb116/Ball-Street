import Joi from 'joi';

import { dv, validate } from '../../util/util';
import validators from '../../util/util.schema';

import { Offer } from '../../../models';
import errorHandler, { ServiceInput } from '../../util/util.service';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

interface GetUserOffersInput extends ServiceInput {
  params: {
    contestID: number,
  },
  body: Record<string, never>
}

function getUserOffers(req: GetUserOffersInput) {
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
      default: { message: 'Cannot retrieve offers', status: 500 },
    }));
}

export default getUserOffers;
