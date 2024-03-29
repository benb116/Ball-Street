import Joi from 'joi';

import Offer from '../../offer/offer.model';
import { validate } from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';

const schema = Joi.object<GetNFLPlayerOffersInput>({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
    nflplayerID: validators.nflplayerID,
  }).required(),
  body: validators.noObj,
});

interface GetNFLPlayerOffersInput extends ServiceInput {
  params: {
    contestID: number,
    nflplayerID: number,
  },
  body: Record<string, never>
}

/** Get current book summary for a player */
// How many offers at each price point?
function getNFLPlayerOfferSummary(req: GetNFLPlayerOffersInput) {
  const value = validate(req, schema);

  const bids = Offer.count({
    group: 'price',
    where: {
      NFLPlayerId: value.params.nflplayerID,
      ContestId: value.params.contestID,
      filled: false,
      cancelled: false,
      isbid: true,
    },
    attributes: ['price'],
  });
  const asks = Offer.count({
    group: 'price',
    where: {
      NFLPlayerId: value.params.nflplayerID,
      ContestId: value.params.contestID,
      filled: false,
      cancelled: false,
      isbid: false,
    },
    attributes: ['price'],
  });

  return Promise.all([bids, asks]);
}

export default getNFLPlayerOfferSummary;
