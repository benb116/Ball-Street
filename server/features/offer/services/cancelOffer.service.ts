import Queue from 'bull';
import Joi from 'joi';

import { cancelOfferInput, CancelOfferInputType, OfferItemType } from '../../../../types/api/offer.api';
import sequelize from '../../../db';
import { queueOptions } from '../../../db/redis';
import { tobj, validate, uError } from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';
import Offer from '../offer.model';

const offerQueue = new Queue('offer-queue', queueOptions);

const bodySchema = Joi.object<CancelOfferInputType>().keys({
  offerID: Joi.string().trim().required().messages({
    'string.base': 'Offer ID is invalid',
    'any.required': 'Please specify a offer',
  }),
}).required();
validate(cancelOfferInput, bodySchema);

const schema = Joi.object<CancelOfferInput>({
  user: validators.user,
  params: Joi.object().keys({
    contestID: Joi.number().optional(),
  }).required(),
  body: bodySchema,
});

interface CancelOfferInput extends ServiceInput {
  params: { contestID: number },
  body: CancelOfferInputType
}

/** Cancel an existing offer */
async function cancelOffer(req: CancelOfferInput): Promise<OfferItemType> {
  const value = validate(req, schema);

  // Cancel offer, but if it's filled, let user know
  return sequelize.transaction(async (t) => {
    const theoffer = await Offer.findByPk(value.body.offerID, tobj(t));
    if (!theoffer) { throw uError('No offer found', 404); }
    if (theoffer.UserId !== value.user) { throw uError('Unauthorized', 403); }
    if (theoffer.filled) { throw uError('Offer already filled', 406); }
    if (theoffer.cancelled) { throw uError('Offer already cancelled', 406); }
    theoffer.set({ cancelled: true });
    await theoffer.save({ transaction: t });
    return theoffer;
  }).then((offer) => {
    offerQueue.add(offer);
    return offer;
  });
}

export default cancelOffer;
