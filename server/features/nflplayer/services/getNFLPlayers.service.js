const u = require('../../util/util');

const { NFLPlayer, NFLTeam } = require('../../../models');

function getNFLPlayers() {
  return NFLPlayer.findAll({ include: [{ model: NFLTeam }] }).then(u.dv);
}

module.exports = getNFLPlayers;
