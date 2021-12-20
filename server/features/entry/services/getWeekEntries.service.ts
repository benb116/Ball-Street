import { Op } from 'sequelize';

import { dv } from '../../util/util';

import Entry from '../entry.model';
import Contest, { ContestType } from '../../contest/contest.model';
import User from '../../user/user.model';

// Get all entries across all of this week's contests
async function getWeekEntries() {
  const weekcontests: ContestType[] = await Contest.findAll({
    where: {
      nflweek: Number(process.env.WEEK),
    },
  }).then(dv);
  const weekcontestIDs = weekcontests.map((c) => c.id);

  const weekEntries = await Entry.findAll({
    where: {
      ContestId: {
        [Op.or]: weekcontestIDs,
      },
    },
    include: {
      model: User,
    },
  }).then(dv);

  return weekEntries;
}

export default getWeekEntries;
