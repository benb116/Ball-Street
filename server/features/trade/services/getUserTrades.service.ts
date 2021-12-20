import Joi from 'joi';
import Offer from '../../offer/offer.model';

import { dv, validate } from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';

import Trade from '../trade.model';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

interface GetUserTradesInput extends ServiceInput {
  params: {
    contestID: number,
  },
  body: Record<string, never>
}

async function getUserTrades(req: GetUserTradesInput) {
  const value: GetUserTradesInput = validate(req, schema);

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
