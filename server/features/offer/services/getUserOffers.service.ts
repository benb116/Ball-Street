import Joi from 'joi';

import { validate } from '../../util/util';
import validators from '../../util/util.schema';
import errorHandler, { ServiceInput } from '../../util/util.service';
import Offer from '../offer.model';

import type { OfferItemType } from '../../../../types/api/offer.api';

const schema = Joi.object<GetUserOffersInput>({
  user: validators.user,
  params: Joi.object().keys({ contestID: validators.contestID }).required(),
  body: validators.noObj,
});

interface GetUserOffersInput extends ServiceInput {
  params: { contestID: number },
  body: Record<string, never>
}

/** Get a user's active offers */
function getUserOffers(req: GetUserOffersInput): Promise<OfferItemType[]> {
  const value = validate(req, schema);
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
