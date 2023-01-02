import Joi from 'joi';
import Offer from '../../offer/offer.model';

import { validate } from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';
import EntryAction from '../entryaction.model';
import EntryActionKind from '../entryactionkind.model';

import Trade from '../trade.model';

import type { TradeTree } from '../../../../types/api/trade.api';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({ contestID: validators.contestID }).required(),
  body: validators.noObj,
});

interface GetUserTradesInput extends ServiceInput {
  params: { contestID: number },
  body: Record<string, never>
}

/** Get all of the trades a user has made, including bids, asks, and entry actions */
async function getUserTrades(req: GetUserTradesInput) {
  const value: GetUserTradesInput = validate(req, schema);

  const bids = Trade.findAll({
    include: [{
      model: Offer,
      as: 'bid',
      where: {
        ContestId: value.params.contestID,
        UserId: value.user,
      },
    }],
  });
  const asks = Trade.findAll({
    include: [{
      model: Offer,
      as: 'ask',
      where: {
        ContestId: value.params.contestID,
        UserId: value.user,
      },
    }],
  });
  const actions = EntryAction.findAll({
    include: [{ model: EntryActionKind }],
    where: {
      ContestId: value.params.contestID,
      UserId: value.user,
    },
  });

  return Promise.all([bids, asks, actions])
    .then((out) => ({ bids: out[0], asks: out[1], actions: out[2] } as TradeTree));
}

export default getUserTrades;
