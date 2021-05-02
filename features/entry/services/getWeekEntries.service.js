const { Op } = require('sequelize');

const u = require('../../util/util');
const config = require('../../../config');

const { Entry, Contest, User } = require('../../../models');

async function getWeekEntries() {
  const weekcontests = await Contest.findAll({
    where: {
      nflweek: config.currentNFLWeek,
    },
  })
    .then(u.dv)
    .then((contests) => contests.map((c) => c.id));

  return Entry.findAll({
    where: {
      ContestId: {
        [Op.or]: weekcontests,
      },
    },
    include: {
      model: User,
    },
  })
    .then(u.dv);
}

module.exports = getWeekEntries;
