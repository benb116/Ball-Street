import service from '../services/getContest.service';
import { ErrorTest, ObjectTest } from '../../util/util.tests';

describe('getContest service', () => {
  test('Valid request returns data', ObjectTest(
    service,
    { user: 1, params: { contestID: 1 }, body: {} },
    {
      id: 1,
      budget: 10000,
      name: 'Ball Street Big One',
      nflweek: Number(process.env['WEEK']),
      buyin: 2000,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      entry: {
        UserId: 1,
        pointtotal: 10000,
        rank: 1,
      },
    },
  ));
  test('Missing contestID returns error 400', ErrorTest(
    service,
    { user: 2, params: { body: {} } },
    400,
    'Please specify a contest',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service,
    { params: { contestID: 1 }, body: {} },
    400,
    'You must be logged in',
  ));

  test('Non-existent contest returns error 404', ErrorTest(
    service,
    { user: 1, params: { contestID: 80 }, body: {} },
    404,
    'No contest found',
  ));
});
