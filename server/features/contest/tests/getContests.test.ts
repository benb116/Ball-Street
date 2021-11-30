import service from '../services/getContests.service'
import { ArrayTest } from '../../util/util'

describe('getContests service', () => {
  test('Valid request for contests returns data', ArrayTest(
    service, { user: 1, params: { }, body: {} },
    [{
      budget: 10000, id: 1, name: 'Ball Street Big One', nflweek: Number(process.env.WEEK),
    }],
  ));
});
