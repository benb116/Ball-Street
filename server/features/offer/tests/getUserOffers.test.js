const service = require('../services/getUserOffers.service');
const { ErrorTest, ArrayTest } = require('../../util/util');

describe('getUserOffers service', () => {
  test('Valid request returns data', ArrayTest(
    service, { user: 2, params: { leagueID: 2, contestID: 2 }, body: {} },
    [{
      ContestId: 2,
      NFLPlayerId: 20933,
      UserId: 2,
      cancelled: false,
      filled: false,
      isbid: false,
      price: 8000,
      protected: false,
    }],
  ));

  test('Missing contestID returns error 400', ErrorTest(
    service, { user: 2, params: { leagueID: 2 }, body: {} },
    400, 'Please specify a contest',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, { params: { leagueID: 1, contestID: 2 }, body: {} },
    400, 'You must be logged in',
  ));
});
