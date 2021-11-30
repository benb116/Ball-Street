import Joi from 'joi';

import { dv, validate } from '../../util/util';

import { Offer } from '../../../models';
import validators from '../../util/util.schema';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
    nflplayerID: validators.nflplayerID,
  }).required(),
  body: validators.noObj,
});

function getNFLPlayerOfferSummary(req) {
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

  return Promise.all([bids, asks]).then(dv);
}

export default getNFLPlayerOfferSummary;
