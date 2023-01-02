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
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

interface GetUserTradesInput extends ServiceInput {
  params: { contestID: number },
  body: Record<string, never>
}

/** Get all of the trades a user has made, including bids, asks, and entry actions */
async function getUserTrades(req: GetUserTradesInput) {
  const value: GetUserTradesInput = validate(req, schema);

  const bids = await Trade.findAll({
    include: [{
      model: Offer,
      as: 'bid',
      where: {
        ContestId: value.params.contestID,
        UserId: value.user,
      },
    }],
  });
  const asks = await Trade.findAll({
    include: [{
      model: Offer,
      as: 'ask',
      where: {
        ContestId: value.params.contestID,
        UserId: value.user,
      },
    }],
  });
  const actions = await EntryAction.findAll({
    include: [{ model: EntryActionKind }],
    where: {
      ContestId: value.params.contestID,
      UserId: value.user,
    },
  });
  return { bids, asks, actions } as TradeTree;
}

export default getUserTrades;
