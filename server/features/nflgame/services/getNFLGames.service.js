const { get } = require('../../../db/redis');
const { NFLGame, NFLTeam } = require('../../../models');
const u = require('../../util/util');

async function getNFLGames() {
  const currentweek = await get.CurrentWeek();
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
