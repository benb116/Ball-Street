import Joi from 'joi';

import { dv, validate } from '../../util/util';
import validators from '../../util/util.schema';

import { Offer, Trade } from '../../../models';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

async function getUserTrades(req) {
  const value = validate(req, schema);

  const allbids = await Trade.findAll({
    include: [{
      model: Offer,
      as: 'bid',
      where: {
        ContestId: value.params.contestID,
        UserId: value.user,
      },
    }],
  }).then(dv);
  const allasks = await Trade.findAll({
    include: [{
      model: Offer,
      as: 'ask',
      where: {
        ContestId: value.params.contestID,
        UserId: value.user,
      },
    }],
  }).then(dv);
  return allbids.concat(allasks);
}

export default getUserTrades;
