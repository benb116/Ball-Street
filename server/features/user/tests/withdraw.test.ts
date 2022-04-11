import service from '../services/withdraw.service';
import { ErrorTest } from '../../util/util.tests';
import { LedgerKindTypes } from '../../../config';
import LedgerEntry from '../../ledger/ledgerEntry.model';
import sequelize from '../../../db';

describe('withdraw service', () => {
  test('Valid request returns data and creates ledger entry', async () => {
    const input = { user: 4, params: {}, body: { amount: 300 } };
    const output = {
      cash: 700,
      email: 'email4@gmail.com',
      id: 4,
      name: 'bot',
      verified: true,
    };
    const out = await service(input);
    expect(out).toMatchObject(output);

    const outLedge = {
      UserId: input.user,
      ContestId: null,
      LedgerKindId: LedgerKindTypes.Withdrawal.id,
      value: input.body.amount,
    };
    const theLedgerEntry = await LedgerEntry.findOne({ where: outLedge });
    expect(theLedgerEntry).toMatchObject(outLedge);

    await sequelize.query(`
      DELETE from "LedgerEntries" WHERE "UserId"=4 AND "value"=300;
      UPDATE "Users" SET "cash"=1000 WHERE "id"=4;
    `);
  });

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
