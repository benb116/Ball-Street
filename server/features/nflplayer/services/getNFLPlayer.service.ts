import Joi from 'joi';

import { validate, uError } from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';

import NFLPlayer from '../nflplayer.model';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    nflplayerID: validators.nflplayerID,
  }).required(),
  body: validators.noObj,
});

interface GetNFLPlayerInput extends ServiceInput {
  params: {
    nflplayerID: number,
  },
  body: Record<string, never>
}

// Get info about an NFLPlayer
async function getNFLPlayer(req: GetNFLPlayerInput) {
  const value: GetNFLPlayerInput = validate(req, schema);

  const theplayer = await NFLPlayer.findByPk(value.params.nflplayerID);
  if (!theplayer || !theplayer.active) { uError('No player found', 404); }
  return theplayer;
}

export default getNFLPlayer;
