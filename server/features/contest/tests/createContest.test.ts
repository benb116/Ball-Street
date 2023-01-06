import { ErrorTest, ObjectTest } from '../../util/util.tests';
import service from '../services/createContest.service';

describe('createContest service', () => {
  test('Valid request returns data', ObjectTest(
    service,
    { user: 2, params: { }, body: { name: 'New Contest', budget: 10000 } },
    {
      id: 5,
      name: 'New Contest',
      budget: 10000,
      nflweek: Number(process.env['WEEK']),
      buyin: 0,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    },
    'DELETE from "Contests" WHERE "name"=\'New Contest\';',
  ));

  test('Missing name returns error 400', ErrorTest(
    service,
    { user: 2, params: { }, body: { budget: 10000 } },
    400,
    'Please specify a name',
  ));

  test('Missing budget returns error 400', ErrorTest(
    service,
    { user: 2, params: { }, body: { name: 'New Contest 7' } },
    400,
    'Please specify a budget',
  ));
});
