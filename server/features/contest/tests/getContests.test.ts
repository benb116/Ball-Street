import { ArrayTest } from '@util/util.tests';
import service from '../services/getContests.service';

describe('getContests service', () => {
  test('Valid request for contests returns data', ArrayTest(
    service,
    { user: 1, params: { }, body: {} },
    [{
      budget: 10000,
      id: 1,
      name: 'Ball Street Big One',
      nflweek: Number(process.env.WEEK),
      buyin: 2000,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }, {
      budget: 10000,
      id: 2,
      name: 'Private Contest',
      nflweek: Number(process.env.WEEK),
      buyin: 500,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }, {
      budget: 10000,
      id: 3,
      name: 'Public Contest 2',
      nflweek: Number(process.env.WEEK),
      buyin: 500,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }],
  ));
});
