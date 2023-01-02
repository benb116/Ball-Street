import NFLPlayer from '../nflplayer.model';
import type { PlayerItemType } from '../../../../types/api/player.api';

/** Get al NFL players that are active */
async function getNFLPlayers(): Promise<PlayerItemType[]> {
  return NFLPlayer.findAll({ where: { active: true } });
}

export default getNFLPlayers;
