const Queue = require('bull');
const Joi = require('joi');

const u = require('../../util/util');
const { validators } = require('../../util/util.schema');

const sequelize = require('../../../db');
const { Offer } = require('../../../models');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const { queueOptions } = require('../../../db/redis');

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

async function cancelOffer(req) {
  const value = u.validate(req, schema);

  // Cancel offer, but if it's filled, let user know
  return sequelize.transaction(isoOption, async (t) => {
    const o = await Offer.findByPk(value.body.offerID, u.tobj(t));
    if (!o) { u.Error('No offer found', 404); }
    if (o.UserId !== value.user) { u.Error('Unauthorized', 403); }
    if (o.filled) { u.Error('Offer already filled', 406); }
    if (o.cancelled) { u.Error('Offer already cancelled', 406); }
    o.cancelled = true;
    await o.save({ transaction: t });
    return o;
  }).then(u.dv).then((offer) => {
    offerQueue.add(offer);
    return offer;
  });
}

module.exports = cancelOffer;
