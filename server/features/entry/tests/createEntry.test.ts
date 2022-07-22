import service from '../services/createEntry.service';
import { ErrorTest } from '../../util/util.tests';
import LedgerEntry from '../../ledger/ledgerEntry.model';
import { LedgerKinds } from '../../../config';
import sequelize from '../../../db';

describe('createEntry service', () => {
  test('Valid request returns data and creates ledger entry', async () => {
    const input = { user: 5, params: { contestID: 3 }, body: {} };
    const output = {
      ContestId: 3,
      DEF1: null,
      FLEX1: null,
      FLEX2: null,
      K1: null,
      QB1: null,
      RB1: null,
      RB2: null,
      TE1: null,
      UserId: 5,
      WR1: null,
      WR2: null,
      pointtotal: 10000,
    };
    const out = await service(input);
    expect(out).toMatchObject(output);

    const outLedge = {
      UserId: input.user,
      ContestId: input.params.contestID,
      LedgerKindId: LedgerKinds['Entry Fee'].id,
      value: 500,
    };
    const theLedgerEntry = await LedgerEntry.findOne({ where: outLedge });
    expect(theLedgerEntry).toMatchObject(outLedge);

    await sequelize.query(`
      DELETE from "Entries" WHERE "ContestId"=3 AND "UserId"=5;
      DELETE from "LedgerEntries" WHERE "ContestId"=3 AND "UserId"=5;
      UPDATE "Users" SET "cash"=1000 WHERE "id"=5;
    `);
  });

  test('Duplicate entry returns error 406', ErrorTest(
    service,
    { user: 1, params: { contestID: 2 }, body: {} },
    406,
    'An entry already exists',
  ));

  test('Insufficient funds returns error 402', ErrorTest(
    service,
    { user: 6, params: { contestID: 1 }, body: {} },
    402,
    'User has insufficient funds',
  ));

  test('Missing contestID returns error 400', ErrorTest(
    service,
    { user: 1, params: { }, body: {} },
    400,
    'Please specify a contest',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service,
    { params: { contestID: 2 }, body: {} },
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
