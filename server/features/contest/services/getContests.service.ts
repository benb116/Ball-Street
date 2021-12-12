import { dv } from '../../util/util';
import Contest from '../contest.model';

async function getContests() {
  return Contest.findAll().then(dv);
}

export default getContests;
