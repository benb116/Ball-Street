import { Op } from 'sequelize'

import { dv, tobj, validate, uError } from '../../util/util'

import { Entry, Contest, User } from '../../../models'

async function getWeekEntries() {
  const weekcontests = await Contest.findAll({
    where: {
      nflweek: Number(process.env.WEEK),
    },
  })
    .then(dv)
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
    .then(dv);
}

export default getWeekEntries;
