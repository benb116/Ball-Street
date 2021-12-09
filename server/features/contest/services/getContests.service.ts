import { dv } from '../../util/util';

import { Contest } from '../../../models';
import { ContestType } from '../contest.model';

async function getContests() {
  const allcontests: ContestType[] = await Contest.findAll().then(dv);
  return allcontests;
}

export default getContests;
