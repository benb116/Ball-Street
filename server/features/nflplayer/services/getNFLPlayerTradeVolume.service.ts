import Joi from 'joi';

import { dv, validate } from '../../util/util';

import { Offer } from '../../../models';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';

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

function getNFLPlayerTradeVolume(req: GetNFLPlayerTradeVolumeInput) {
  const value = validate(req, schema);

  return Offer.count({
    where: {
      ContestId: value.params.contestID,
      NFLPlayerId: value.params.nflplayerID,
    },
  }).then(dv).then((out: number) => out / 2);
}

export default getNFLPlayerTradeVolume;
