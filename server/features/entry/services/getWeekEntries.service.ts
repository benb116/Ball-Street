import { Op } from 'sequelize';

import { dv } from '../../util/util';

import { Entry, Contest, User } from '../../../models';
import { EntryIncludeUser } from '../entry.model';
import { ContestType } from '../../contest/contest.model';

async function getWeekEntries() {
  const weekcontests: ContestType[] = await Contest.findAll({
    where: {
      nflweek: Number(process.env.WEEK),
    },
  }).then(dv);
  const weekcontestIDs = weekcontests.map((c) => c.id);

  const weekEntries: EntryIncludeUser[] = await Entry.findAll({
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
