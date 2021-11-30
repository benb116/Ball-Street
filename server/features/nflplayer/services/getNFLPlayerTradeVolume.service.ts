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

function getNFLPlayerTradeVolume(req) {
  const value = validate(req, schema);

  return Offer.count({
    where: {
      ContestId: value.params.contestID,
      NFLPlayerId: value.params.nflplayerID,
    },
  }).then(dv).then((out: number) => out / 2);
}

export default getNFLPlayerTradeVolume;
