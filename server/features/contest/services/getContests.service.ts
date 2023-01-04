import Contest from '../contest.model';

import type { ContestItemType } from '../../../../types/api/contest.api';

/** Get all contests */
async function getContests(): Promise<ContestItemType[]> {
  return Contest.findAll();
}

export default getContests;
