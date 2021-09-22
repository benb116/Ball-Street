const service = require('../services/getEntryRank.service');
const { ErrorTest, ObjectTest } = require('../../util/util');

describe('getEntryRank service', () => {
  test('Valid request returns data', ObjectTest(
    service, { user: 3, params: { leagueID: 1, contestID: 1 }, body: {} },
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
      rank: 1,
    },
  ));

  test('Missing contestID returns error 400', ErrorTest(
    service, { user: 2, params: { leagueID: 1 }, body: {} },
    400, 'Please specify a contest',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, { params: { leagueID: 1, contestID: 1 }, body: {} },
    400, 'You must be logged in',
  ));

  test('Non-existent user+contest returns error 404', ErrorTest(
    service, { user: 1, params: { leagueID: 2, contestID: 80 }, body: {} },
    404, 'No entry found',
  ));
});
