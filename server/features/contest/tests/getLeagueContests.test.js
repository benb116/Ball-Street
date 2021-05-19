const service = require('../services/getLeagueContests.service');
const { ErrorTest, ArrayTest } = require('../../util/util');

describe('getLeagueContests service', () => {
  test('Valid request for public leagues returns data', ArrayTest(
    service, { user: 1, params: { leagueID: 1 }, body: {} },
    [{
      LeagueId: 1, budget: 10000, id: 1, name: 'Ball Street Big One', nflweek: 1,
    }],
  ));

  test('Valid request for private leagues returns data', ArrayTest(
    service, { user: 1, params: { leagueID: 2 }, body: {} },
    [{
      LeagueId: 2, budget: 10000, id: 2, name: 'Private Contest', nflweek: 1,
    }],
  ));

  test('Invalid request from private league returns error 403', ErrorTest(
    service, { user: 4, params: { leagueID: 2 }, body: {} },
    403, 'You are not a member of that league',
  ));

  test('Missing leagueID returns error 400', ErrorTest(
    service, { user: 2, params: {}, body: {} },
    400, 'Please specify a league',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, { params: { leagueID: 1 }, body: {} },
    400, 'You must be logged in',
  ));

  test('Non-existent league returns error 404', ErrorTest(
    service, { user: 1, params: { leagueID: 80 }, body: {} },
    404, 'No league found',
  ));
});
