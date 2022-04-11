import service from '../services/getUserLedger.service';
import { ErrorTest, ArrayTest } from '../../util/util.tests';

describe('getUserOffers service', () => {
  test('Valid request returns data', ArrayTest(
    service, { user: 3, params: {}, body: {} },
    [{
      ContestId: 2,
      LedgerKindId: 3,
      UserId: 3,
      id: '16c94b61-3c76-4078-8fbc-67fac7ed26a2',
      value: 500,
    },
    {
      ContestId: 3,
      LedgerKindId: 3,
      UserId: 3,
      id: '16c94b61-3c76-4078-8fbc-67fac7ed26a6',
      value: 500,
    },
    {
      ContestId: 1,
      LedgerKindId: 3,
      UserId: 3,
      id: '16c94b61-3c76-4078-8fbc-67fac7ed26b2',
      value: 2000,
    }, {
      ContestId: null,
      LedgerKindId: 1,
      UserId: 3,
      id: '16c94b61-3c76-4078-8fbc-67fac7ed26d2',
      value: 3000,
    }],
  ));

  test('Valid page 2 request returns empty', ArrayTest(
    service, { user: 3, params: { page: 2 }, body: {} },
    [],
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, { params: { }, body: {} },
    400, 'You must be logged in',
  ));
});
