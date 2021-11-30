const u = require('../../util/util');

const { Contest } = require('../../../models');

function getContests() {
  return Contest.findAll().then(u.dv);
}

module.exports = getContests;
