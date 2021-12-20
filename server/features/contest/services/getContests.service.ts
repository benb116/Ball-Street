import { dv } from '../../util/util';

import Contest from '../contest.model';

// Get all contests
async function getContests() {
  return Contest.findAll().then(dv);
}

export default getContests;
