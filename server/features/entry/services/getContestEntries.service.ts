import Joi from 'joi';
import { RosterPositions } from '../../../config';
import projprice from '../../../db/redis/projprice.redis';

import { validate } from '../../util/util';
import validators from '../../util/util.schema';
import errorHandler, { ServiceInput } from '../../util/util.service';

import Entry from '../entry.model';

const schema = Joi.object({
  user: validators.user,
  params: Joi.object().keys({
    contestID: validators.contestID,
  }).required(),
  body: validators.noObj,
});

interface GetContestEntriesInput extends ServiceInput {
  params: {
    contestID: number,
  },
  body: Record<string, never>
}

// Get all entries in a contest
function getContestEntries(req: GetContestEntriesInput) {
  const value: GetContestEntriesInput = validate(req, schema);

  return Entry.findAll({ where: { ContestId: value.params.contestID } })
    // We want to show the projected totals for each entry, not just current balance.
    // Determine how many points to add to balance based on projections
    .then(async (out) => {
      // Get all player proj values
      // Possible improvement: build list of players to get instead of all, use HMGET
      const projMap = await projprice.getall();
      // For each entry
      return out.map((e) => {
        // Calculate the projected total starting with the balance
        // For each roster position, see if theres a proj value and add it
        const projTotal = RosterPositions.reduce((acc, curPos) => {
          let newTotal = acc;
          const thisPlayer = e[curPos];
          if (!thisPlayer) return newTotal;
          newTotal += Number(projMap[thisPlayer]) || 0;
          return newTotal;
        }, e.pointtotal);
        return { ...e.get(), projTotal };
      });
    })
    .catch(errorHandler({
      default: { message: 'Entries could not be retrieved', status: 500 },
    }));
}

export default getContestEntries;
