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
});
