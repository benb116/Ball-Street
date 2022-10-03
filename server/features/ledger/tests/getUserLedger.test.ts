import service from '../services/getUserLedger.service';
import { ErrorTest, ArrayTest } from '../../util/util.tests';

describe('getUserLedger service', () => {
  test('Valid request returns data', ArrayTest(
    service,
    { user: 3, params: {}, body: {} },
    [{
      ContestId: 2,
      LedgerKind: {
        id: 3,
        isCredit: false,
        name: 'Entry Fee',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
      LedgerKindId: 3,
      UserId: 3,
      id: '16c94b61-3c76-4078-8fbc-67fac7ed26a2',
      value: 500,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    },
    {
      ContestId: 3,
      LedgerKind: {
        id: 3,
        isCredit: false,
        name: 'Entry Fee',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
      LedgerKindId: 3,
      UserId: 3,
      id: '16c94b61-3c76-4078-8fbc-67fac7ed26a6',
      value: 500,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    },
    {
      ContestId: 1,
      LedgerKind: {
        id: 3,
        isCredit: false,
        name: 'Entry Fee',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
      LedgerKindId: 3,
      UserId: 3,
      id: '16c94b61-3c76-4078-8fbc-67fac7ed26b2',
      value: 2000,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }, {
      ContestId: null,
      LedgerKind: {
        id: 1,
        isCredit: true,
        name: 'Deposit',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
      LedgerKindId: 1,
      UserId: 3,
      id: '16c94b61-3c76-4078-8fbc-67fac7ed26d2',
      value: 3000,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }],
  ));

  test('Valid page 2 request returns empty', ArrayTest(
    service,
    { user: 3, params: { page: 2 }, body: {} },
    [],
  ));

  test('Missing userID returns error 400', ErrorTest(
    service,
    { params: { }, body: {} },
    400,
    'You must be logged in',
  ));
});
