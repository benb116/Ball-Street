import sequelize from '../../db';
import Entry from '../entry/entry.model';

import { isInvalidSpot, isPlayerOnRoster, isOpenRoster } from './util';

describe('util testing', () => {
  test('isInvalidSpot', () => {
    expect(isInvalidSpot(3, 'WR1')).toBe(false);
    expect(isInvalidSpot(2, 'WR1')).toBe('Trying to put a player in an incorrect position!');
    expect(isInvalidSpot(3, 'FLEX1')).toBe(false);
    expect(isInvalidSpot(1, 'FLEX1')).toBe('Trying to put a non-flex player in a flex position!');
  });

  test('isPlayerOnRoster', () => {
    const theentry = {
      UserId: 3,
      ContestId: 2,
      pointtotal: 500,
      RB1: 31885,
      K1: 30266,
    };
    expect(isPlayerOnRoster(theentry, 30266)).toBe('K1');
    expect(isPlayerOnRoster(theentry, 12345)).toBe('');
  });

  test('isOpenRoster', () => {
    const theentry = {
      UserId: 3,
      ContestId: 2,
      pointtotal: 500,
      QB1: null,
      RB1: 31885,
      RB2: null,
      K1: 30266,
    };
    expect(isOpenRoster(theentry, 5)).toBe(false);
    expect(isOpenRoster(theentry, 1)).toBe('QB1');
    expect(isOpenRoster(theentry, 2)).toBe('RB2');
    const theentry2 = {
      pointtotal: 4500,
      UserId: 2,
      ContestId: 1,
      QB1: 30123,
      RB1: 33138,
      RB2: 30180,
      WR1: null,
      WR2: null,
      TE1: null,
      FLEX1: 32736,
      FLEX2: null,
      K1: null,
      DEF1: 33,
    };
    expect(isOpenRoster(theentry2, 2)).toBe('FLEX2');
  });

  test('Transaction locking', async () => {
    const t1 = await sequelize.transaction();
    const t2 = await sequelize.transaction();

    let theentry2 = new Promise(() => { });

    // Lock the row, update and commit after 3 seconds, then recheck the row
    Entry.findOne({
      where: { UserId: 5, ContestId: 2 },
      transaction: t1,
      lock: t1.LOCK.UPDATE,
    }).then(async (e) => {
      // Right after the first row lock, try a second
      // This should wait until first lock is released
      // Check outside of the try block that new value is received
      theentry2 = Entry.findOne({
        where: { UserId: 5, ContestId: 2 },
        transaction: t2,
        lock: t2.LOCK.UPDATE,
      }).then((e2) => {
        if (!e2) return null;
        return e2.get('pointtotal');
      });

      if (!e) return;
      await e.update({ pointtotal: 100 }, { transaction: t1 });
      setTimeout(async () => { await t1.commit(); }, 1000);
    // eslint-disable-next-line no-console
    }).catch(console.error);

    // Because we use Read Committed, select commands without for update
    // are not locked and don't wait for the locking transaction to complete
    const theentry3 = await Entry.findOne({
      where: {
        UserId: 5,
        ContestId: 2,
      },
    });
    if (!theentry3) return;
    expect(theentry3.get('pointtotal')).toBe(500);

    // This second transaction should have waited and requeried
    // So it should see the new data
    const out = await theentry2;
    expect(out).toBe(100);
  }, 5000);
});
