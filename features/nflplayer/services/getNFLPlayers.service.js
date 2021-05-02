const u = require('../../util/util');

const { NFLPlayer, NFLTeam, NFLPosition } = require('../../../models');

function getNFLPlayers() {
  return NFLPlayer.findAll({ include: [{ model: NFLTeam }, { model: NFLPosition }] }).then(u.dv);
}

module.exports = getNFLPlayers;
