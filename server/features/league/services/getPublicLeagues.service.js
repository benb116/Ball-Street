const u = require('../../util/util');

const { League } = require('../../../models');

// Get info for a specific contest
function getPublicLeagues() {
  return League.findAll({ where: { ispublic: true } }).then(u.dv).then((out) => out);
}

module.exports = getPublicLeagues;
