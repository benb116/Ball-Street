import service from '../services/createContest.service';
import { ErrorTest, ObjectTest } from '../../util/util';

describe('createContest service', () => {
  test('Valid request returns data', ObjectTest(
    service, { user: 2, params: { }, body: { name: 'New Contest', budget: 10000 } },
    {
      name: 'New Contest', budget: 10000, nflweek: Number(process.env.WEEK),
    },
  ));

  test('Missing name returns error 400', ErrorTest(
    service, { user: 2, params: { }, body: { budget: 10000 } },
    400, 'Please specify a name',
  ));

  test('Missing budget returns error 400', ErrorTest(
    service, { user: 2, params: { }, body: { name: 'New Contest 7' } },
    400, 'Please specify a budget',
  ));
});
