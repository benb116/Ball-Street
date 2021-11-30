const u = require('../../util/util');

const { NFLPlayer } = require('../../../models');

function getNFLPlayers() {
  return NFLPlayer.findAll({ where: { active: true } }).then(u.dv);
}

module.exports = getNFLPlayers;
