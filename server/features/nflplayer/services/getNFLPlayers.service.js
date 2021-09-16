const u = require('../../util/util');

const { NFLPlayer, NFLPosition } = require('../../../models');

function getNFLPlayers() {
  return NFLPlayer.findAll({ include: [{ model: NFLPosition }] }).then(u.dv);
}

module.exports = getNFLPlayers;
