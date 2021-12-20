import Queue from 'bull';
import Joi from 'joi';

import {
  dv, tobj, validate, uError,
} from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';

import sequelize from '../../../db';
import { queueOptions } from '../../../db/redis';

import Offer, { OfferType } from '../offer.model';

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

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

async function cancelOffer(req: CancelOfferInput) {
  const value: CancelOfferInput = validate(req, schema);

  // Cancel offer, but if it's filled, let user know
  return sequelize.transaction(isoOption, async (t) => {
    const o = await Offer.findByPk(value.body.offerID, tobj(t));
    if (!o) { return uError('No offer found', 404); }
    const oValue: OfferType = dv(o);
    if (oValue.UserId !== value.user) { uError('Unauthorized', 403); }
    if (oValue.filled) { uError('Offer already filled', 406); }
    if (oValue.cancelled) { uError('Offer already cancelled', 406); }
    o.set({ cancelled: true });
    await o.save({ transaction: t });
    return o;
  }).then(dv).then((offer) => {
    offerQueue.add(offer);
    return offer;
  });
}

export default cancelOffer;
