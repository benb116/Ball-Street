import { Op } from 'sequelize';
import { LedgerKinds } from '../../../config';
import LedgerEntry from '../../ledger/ledgerEntry.model';
import User from '../../user/user.model';
import { ErrorTest } from '../../util/util.tests';
import Entry from '../entry.model';
import service from '../services/payoutContest.service';

const contestID = 4;

describe('createEntry service', () => {
  test('Valid request returns data and creates ledger entry', async () => {
    await service(contestID);

    // Confirm pointtotals have been wiped
    const entries = await Entry.findAll({ where: { ContestId: contestID } });
    entries.forEach((e) => {
      expect(e.pointtotal).toBe(0);
    });

    // Confirm user balances have updated
    const users = await User.findAll({ where: { id: { [Op.in]: [4, 5, 6] } } });
    const finalCash = {
      4: 643,
      5: 1067,
      6: 272,
    };
    users.forEach((u) => {
      const userID = u.id as 4 | 5 | 6;
      expect(u.cash).toBe(finalCash[userID]);
    });

    // Confirm ledger entry creation
    const ledgers = await LedgerEntry.findAll({
      where: {
        UserId: { [Op.in]: [4, 5, 6] },
        ContestId: contestID,
        LedgerKindId: { [Op.in]: [LedgerKinds['Entry Prize'].id, LedgerKinds['Profit Fee'].id] },
      },
    });
    expect(ledgers.length).toBe(5);
    expect(ledgers).toStrictEqual(expect.arrayContaining([
      expect.objectContaining({
        ContestId: contestID,
        LedgerKindId: LedgerKinds['Entry Prize'].id,
        UserId: 4,
        value: -357,
      }),
      expect.objectContaining({
        ContestId: contestID,
        LedgerKindId: LedgerKinds['Entry Prize'].id,
        UserId: 5,
        value: 71,
      }),
      expect.objectContaining({
        ContestId: contestID,
        LedgerKindId: LedgerKinds['Profit Fee'].id,
        UserId: 5,
        value: 4,
      }),
      expect.objectContaining({
        ContestId: contestID,
        LedgerKindId: LedgerKinds['Entry Prize'].id,
        UserId: 6,
        value: 286,
      }),
      expect.objectContaining({
        ContestId: contestID,
        LedgerKindId: LedgerKinds['Profit Fee'].id,
        UserId: 6,
        value: 14,
      })]));
  });

  test('Fails if player is left on roster', ErrorTest(
    service,
    3,
    500,
    'Entry has remaining players contest:3 user:1',
  ));

  test('Fails if contest does not exist', ErrorTest(
    service,
    8,
    404,
    'No contest found',
  ));

  test('Fails if contestid not number', ErrorTest(
    service,
    'e',
    400,
    'Contest ID is invalid',
  ));
});
