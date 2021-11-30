import { dv } from '../../util/util'

import { Contest } from '../../../models'

function getContests() {
  return Contest.findAll().then(dv);
}

export default getContests;
