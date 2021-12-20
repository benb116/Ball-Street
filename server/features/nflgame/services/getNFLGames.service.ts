import { dv } from '../../util/util';

import NFLTeam from '../../nflteam/nflteam.model';
import NFLGame from '../nflgame.model';

// Get all NFL games
async function getNFLGames() {
  const currentweek = Number(process.env.WEEK);
  return NFLGame.findAll({
    include: [{
      model: NFLTeam,
      as: 'home',
    }, {
      model: NFLTeam,
      as: 'away',
    }],
    where: {
      week: currentweek,
    },
  }).then(dv);
}

export default getNFLGames;
