import Joi from 'joi'

import { dv, tobj, validate, uError } from '../../util/util'
import validators from '../../util/util.schema'

import { NFLPlayer } from '../../../models'

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    nflplayerID: validators.nflplayerID,
  }).required(),
  body: validators.noObj,
});

async function getNFLPlayer(req) {
  const value = validate(req, schema);

  const theplayer = await NFLPlayer.findOne({
    where: {
      id: value.params.nflplayerID,
      active: true,
    },
  }).then(dv);
  if (!theplayer) { uError('No player found', 404); }
  return theplayer;
}

export default getNFLPlayer;
