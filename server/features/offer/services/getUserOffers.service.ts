import Joi from 'joi';

import { validate } from '@util/util';
import validators from '@util/util.schema';
import errorHandler, { ServiceInput } from '@util/util.service';

import Offer from '../offer.model';

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
  const value: GetUserOffersInput = validate(req, schema);
  return Offer.findAll({
    where: {
      UserId: value.user,
      ContestId: value.params.contestID,
      filled: false,
      cancelled: false,
    },
  })
    .catch(errorHandler({
      default: { message: 'Cannot retrieve offers', status: 500 },
    }));
}

export default getUserOffers;
