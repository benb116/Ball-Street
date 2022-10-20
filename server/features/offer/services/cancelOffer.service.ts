import Queue from 'bull';
import Joi from 'joi';

import { tobj, validate, uError } from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';

import sequelize from '../../../db';
import { queueOptions } from '../../../db/redis';

import Offer from '../offer.model';

const offerQueue = new Queue('offer-queue', queueOptions);

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: Joi.number().optional(),
  }).required(),
  body: Joi.object().keys({
    offerID: Joi.string().trim().required().messages({
      'string.base': 'Offer ID is invalid',
      'any.required': 'Please specify a offer',
    }),
  }).required(),
});

interface CancelOfferInput extends ServiceInput {
  params: {
    contestID: number,
  },
  body: {
    offerID: string,
  }
}

/** Cancel an existing offer */
async function cancelOffer(req: CancelOfferInput) {
  const value: CancelOfferInput = validate(req, schema);

  // Cancel offer, but if it's filled, let user know
  return sequelize.transaction(async (t) => {
    const theoffer = await Offer.findByPk(value.body.offerID, tobj(t));
    if (!theoffer) { return uError('No offer found', 404); }
    if (theoffer.UserId !== value.user) { return uError('Unauthorized', 403); }
    if (theoffer.filled) { return uError('Offer already filled', 406); }
    if (theoffer.cancelled) { return uError('Offer already cancelled', 406); }
    theoffer.set({ cancelled: true });
    await theoffer.save({ transaction: t });
    return theoffer;
  }).then((offer) => {
    offerQueue.add(offer);
    return offer;
  });
}

export default cancelOffer;
