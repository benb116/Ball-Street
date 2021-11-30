import { NFLGame, NFLTeam } from '../../../models';
import { dv } from '../../util/util';

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
