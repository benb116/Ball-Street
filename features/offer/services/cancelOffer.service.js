const Queue = require('bull');
const Joi = require('joi');

const offerQueue = new Queue('offer-queue');

const u = require('../../util/util');

const sequelize = require('../../../db');
const { Offer } = require('../../../models');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const schema = Joi.object({
  user: Joi.number().integer().greater(0).required(),
  params: Joi.object().keys({
    leagueID: Joi.string().alphanum().trim().optional(),
    contestID: Joi.string().alphanum().trim().required(),
  }).required(),
  body: Joi.object().keys({
    offerID: Joi.string().trim().required(),
  }).required(),
});

function cancelOffer(req) {
  const { value, error } = schema.validate(req);
  if (error) { u.Error(error, 400); }

  // Cancel offer, but if it's filled, let user know
  return sequelize.transaction(isoOption, async (t) => {
    const o = await Offer.findByPk(value.body.offerID, u.tobj(t));
    if (!o) { u.Error('No offer found', 404); }
    if (o.filled) { u.Error('Offer already filled', 406); }
    o.cancelled = true;
    await o.save({ transaction: t });
    return o;
  }).then(u.dv).then((offer) => {
    offerQueue.add(offer);
    return offer;
  });
}

module.exports = cancelOffer;
