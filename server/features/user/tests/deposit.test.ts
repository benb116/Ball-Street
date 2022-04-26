import service from '../services/deposit.service';
import { ErrorTest, ObjectTest } from '../../util/util.tests';

describe('deposit service', () => {
  test('Valid request returns data and creates ledger entry', ObjectTest(
    service, { user: 4, params: {}, body: { amount: 300 } },
    {
      ContestId: null,
      LedgerKindId: 1,
      UserId: 4,
      value: 300,
    },
    `
      DELETE from "LedgerEntries" WHERE "UserId"=4 AND "value"=300;
      UPDATE "Users" SET "cash"=1000 WHERE "id"=4;
    `,
  ));

  test('Bad value returns error 400', ErrorTest(
    service, { user: 4, params: {}, body: { amount: -100 } },
    400, 'Deposit amount must be positive',
  ));

  test('Missing user returns error 404', ErrorTest(
    service, { user: 92, params: {}, body: { amount: 100 } },
    404, 'No user found',
  ));

  test('Missing amount returns error 400', ErrorTest(
    service, { user: 4, params: {}, body: { } },
    400, 'Deposit amount is invalid',
  ));
});
