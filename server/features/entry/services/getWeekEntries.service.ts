import { Op } from 'sequelize';

import { dv } from '../../util/util';

import { Entry, Contest, User } from '../../../models';

interface ContestObj {
  id: number,
}

async function getWeekEntries() {
  const weekcontests = await Contest.findAll({
    where: {
      nflweek: Number(process.env.WEEK),
    },
  })
    .then(dv)
    .then((contests: ContestObj[]) => contests.map((c) => c.id));

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
