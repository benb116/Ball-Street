import service from '../services/deposit.service';
import { ErrorTest } from '../../util/util.tests';
import { LedgerKindTypes } from '../../../config';
import LedgerEntry from '../../ledger/ledgerEntry.model';
import sequelize from '../../../db';

describe('login service', () => {
  test('Valid request returns data and creates ledger entry', async () => {
    const input = { user: 4, params: {}, body: { amount: 300 } };
    const output = {
      cash: 1300,
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
      LedgerKindId: LedgerKindTypes.Deposit.id,
      value: input.body.amount,
    };
    const theLedgerEntry = await LedgerEntry.findOne({ where: outLedge });
    expect(theLedgerEntry).toMatchObject(outLedge);

    await sequelize.query(`
      DELETE from "LedgerEntries" WHERE "UserId"=4 AND "value"=300;
      UPDATE "Users" SET "cash"=1000 WHERE "id"=4;
    `);
  });

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
