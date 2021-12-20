import { dv } from '../../util/util';

import NFLPlayer, { NFLPlayerType } from '../nflplayer.model';

// Get al NFL players that are active
async function getNFLPlayers() {
  const allplayers: NFLPlayerType[] = await NFLPlayer.findAll({ where: { active: true } }).then(dv);
  return allplayers;
}

export default getNFLPlayers;
