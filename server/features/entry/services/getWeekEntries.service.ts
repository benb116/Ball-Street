import Contest from '@features/contest/contest.model';
import User from '@features/user/user.model';
import Entry from '../entry.model';

/** Get all entries across all of this week's contests */
async function getWeekEntries() {
  return Entry.findAll({
    include: [
      { model: User },
      {
        model: Contest,
        where: {
          nflweek: Number(process.env.WEEK),
        },
      },
    ],
  });
}

export default getWeekEntries;
