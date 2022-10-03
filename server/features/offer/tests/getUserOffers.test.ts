import service from '../services/getUserOffers.service';
import { ErrorTest, ArrayTest } from '@util/util.tests';

describe('getUserOffers service', () => {
  test('Valid request returns data', ArrayTest(
    service,
    { user: 3, params: { contestID: 1 }, body: {} },
    [{
      id: '16c94b61-3c76-4078-8fbc-67fac7ed26c7',
      UserId: 3,
      ContestId: 1,
      NFLPlayerId: 31885,
      isbid: true,
      price: 800,
      filled: false,
      cancelled: false,
      protected: false,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }],
  ));

  test('Missing contestID returns error 400', ErrorTest(
    service,
    { user: 2, params: { }, body: {} },
    400,
    'Please specify a contest',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service,
    { params: { contestID: 2 }, body: {} },
    400,
    'You must be logged in',
  ));
});
