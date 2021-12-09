import Queue from 'bull';
import Joi from 'joi';

import {
  dv, tobj, validate, uError,
} from '../../util/util';
import validators from '../../util/util.schema';
import { queueOptions } from '../../../db/redis';

import sequelize from '../../../db';
import { Offer } from '../../../models';
import { ServiceInput } from '../../util/util.service';

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
  const value = validate(req, schema);

  // Cancel offer, but if it's filled, let user know
  return sequelize.transaction(isoOption, async (t) => {
    const o = await Offer.findByPk(value.body.offerID, tobj(t));
    if (!o) { uError('No offer found', 404); }
    if (o.UserId !== value.user) { uError('Unauthorized', 403); }
    if (o.filled) { uError('Offer already filled', 406); }
    if (o.cancelled) { uError('Offer already cancelled', 406); }
    o.cancelled = true;
    await o.save({ transaction: t });
    return o;
  }).then(dv).then((offer) => {
    offerQueue.add(offer);
    return offer;
  });
}

export default cancelOffer;
