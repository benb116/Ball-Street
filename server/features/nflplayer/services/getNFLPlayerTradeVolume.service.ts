import Joi from 'joi';

import { validate } from '@util/util';
import validators from '@util/util.schema';
import { ServiceInput } from '@util/util.service';

import Offer from '@features/offer/offer.model';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
    nflplayerID: validators.nflplayerID,
  }).required(),
  body: validators.noObj,
});

interface GetNFLPlayerTradeVolumeInput extends ServiceInput {
  params: {
    contestID: number,
    nflplayerID: number,
  },
  body: Record<string, never>
}

// How many offers exist for a player in a contest?
function getNFLPlayerTradeVolume(req: GetNFLPlayerTradeVolumeInput) {
  const value: GetNFLPlayerTradeVolumeInput = validate(req, schema);

  return Offer.count({
    where: {
      ContestId: value.params.contestID,
      NFLPlayerId: value.params.nflplayerID,
    },
  }).then((out) => out / 2);
}

export default getNFLPlayerTradeVolume;
