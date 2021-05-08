const service = require('../services/getContestEntries.service');
const { ErrorTest, ArrayTest } = require('../../util/util');

describe('getContestEntries service', () => {
  test('Valid request for public leagues returns data', ArrayTest(
    service, { user: 1, params: { leagueID: 1, contestID: 1 }, body: {} },
    [{
      ContestId: 1,
      DEF1: null,
      FLEX1: null,
      FLEX2: null,
      K1: null,
      QB1: null,
      RB1: 20933,
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
      RB1: 20933,
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
      RB1: 20933,
      RB2: null,
      TE1: null,
      UserId: 3,
      WR1: null,
      WR2: null,
      pointtotal: 10000,
    }],
  ));

  test('Valid request for private leagues returns data', ArrayTest(
    service, { user: 1, params: { leagueID: 2, contestID: 2 }, body: {} },
    [],
  ));

  test('Invalid request from private league returns error 403', ErrorTest(
    service, { user: 3, params: { leagueID: 2, contestID: 2 }, body: {} },
    403, 'You are not a member of that league',
  ));

  test('Missing leagueID returns error 400', ErrorTest(
    service, { user: 2, params: { contestID: 2 }, body: {} },
    400, 'Please specify a league',
  ));

  test('Missing contestID returns error 400', ErrorTest(
    service, { user: 2, params: { leagueID: 2 }, body: {} },
    400, 'Please specify a contest',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, { params: { leagueID: 1, contestID: 2 }, body: {} },
    400, 'You must be logged in',
  ));

  test('Non-existent league returns error 404', ErrorTest(
    service, { user: 1, params: { leagueID: 80, contestID: 2 }, body: {} },
    404, 'No league found',
  ));

  test('Non-existent contest returns error 404', ErrorTest(
    service, { user: 1, params: { leagueID: 2, contestID: 80 }, body: {} },
    404, 'No contest found',
  ));
});
