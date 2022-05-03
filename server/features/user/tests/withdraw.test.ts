import service from '../services/withdraw.service';
import { ErrorTest, ObjectTest } from '../../util/util.tests';

describe('withdraw service', () => {
  test('Valid request returns data and creates ledger entry', ObjectTest(
    service, { user: 4, params: {}, body: { amount: 300 } },
    {
      ContestId: null,
      LedgerKindId: 2,
      UserId: 4,
      value: 300,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      id: expect.stringContaining('-'),
    },
    `
      DELETE from "LedgerEntries" WHERE "UserId"=4 AND "value"=300;
      UPDATE "Users" SET "cash"=1000 WHERE "id"=4;
    `,
  ));

  test('Too big withdrawal returns error 402', ErrorTest(
    service, { user: 4, params: {}, body: { amount: 10000 } },
    402, 'User has insufficient funds',
  ));

  test('Bad value returns error 400', ErrorTest(
    service, { user: 4, params: {}, body: { amount: -100 } },
    400, 'Withdrawal amount must be positive',
  ));

  test('Missing user returns error 404', ErrorTest(
    service, { user: 92, params: {}, body: { amount: 100 } },
    404, 'No user found',
  ));

  test('Missing amount returns error 400', ErrorTest(
    service, { user: 4, params: {}, body: { } },
    400, 'Withdrawal amount is invalid',
  ));
});
