const u = require('./util');

describe('util testing', () => {
  test('isInvalidSpot', () => {
    expect(u.isInvalidSpot(3, 'WR1')).toBe(false);
    expect(u.isInvalidSpot(2, 'WR1')).toBe('Trying to put a player in an incorrect position!');
    expect(u.isInvalidSpot(3, 'FLEX1')).toBe(false);
    expect(u.isInvalidSpot(1, 'FLEX1')).toBe('Trying to put a non-flex player in a flex position!');
  });

  test('isPlayerOnRoster', () => {
    const theentry = {
      UserId: 3, ContestId: 2, pointtotal: 500, RB1: 31885, K1: 30266,
    };
    expect(u.isPlayerOnRoster(theentry, 30266)).toBe('K1');
    expect(u.isPlayerOnRoster(theentry, 12345)).toBe(false);
  });

  test('isOpenRoster', () => {
    const theentry = {
      UserId: 3, ContestId: 2, pointtotal: 500, QB1: null, RB1: 31885, RB2: null, K1: 30266,
    };
    expect(u.isOpenRoster(theentry, 5)).toBe(false);
    expect(u.isOpenRoster(theentry, 1)).toBe('QB1');
    expect(u.isOpenRoster(theentry, 2)).toBe('RB2');
  });
});
