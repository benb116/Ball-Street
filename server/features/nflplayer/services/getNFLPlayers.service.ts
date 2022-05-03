import NFLPlayer from '../nflplayer.model';

// Get al NFL players that are active
async function getNFLPlayers() {
  return NFLPlayer.findAll({ where: { active: true } });
}

export default getNFLPlayers;
