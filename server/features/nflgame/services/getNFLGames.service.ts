const { NFLGame, NFLTeam } = require('../../../models');
const u = require('../../util/util');

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
  }).then(u.dv);
}

module.exports = getNFLGames;
