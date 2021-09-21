const u = require('../../util/util');

const { NFLPlayer } = require('../../../models');

function getNFLPlayers() {
  return NFLPlayer.findAll().then(u.dv);
}

module.exports = getNFLPlayers;
