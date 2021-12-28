import service from '../services/getContestEntries.service';
import { ErrorTest, ArrayTest } from '../../util/util.tests';

describe('getContestEntries service', () => {
  test('Valid request returns data', ArrayTest(
    service, { user: 1, params: { contestID: 1 }, body: {} },
    [{
      ContestId: 1,
      DEF1: null,
      FLEX1: null,
      FLEX2: null,
      K1: null,
      QB1: null,
      RB1: 31885,
      RB2: null,
      TE1: null,
      UserId: 1,
      WR1: null,
      WR2: null,
      pointtotal: 10000,
    },
    {
      ContestId: 1,
      DEF1: null,
      FLEX1: null,
      FLEX2: null,
      K1: null,
      QB1: null,
      RB1: 31885,
      RB2: null,
      TE1: null,
      UserId: 2,
      WR1: null,
      WR2: null,
      pointtotal: 10000,
    },
    {
      ContestId: 1,
      DEF1: null,
      FLEX1: null,
      FLEX2: null,
      K1: null,
      QB1: null,
      RB1: 31885,
      RB2: null,
      TE1: null,
      UserId: 3,
      WR1: null,
      WR2: null,
      pointtotal: 10000,
    }],
  ));

  test('Missing contestID returns error 400', ErrorTest(
    service, { user: 2, params: { }, body: {} },
    400, 'Please specify a contest',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, { params: { contestID: 2 }, body: {} },
    400, 'You must be logged in',
  ));

  test('Non-existent contest returns empty', async () => {
    const out = await service({ user: 1, params: { contestID: 80 }, body: {} });
    expect(out).toEqual([]);
  });
});
