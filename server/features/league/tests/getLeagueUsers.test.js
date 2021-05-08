const service = require('../services/getLeagueUsers.service');
const { ErrorTest, ArrayTest } = require('../../util/util');

describe('getLeagueUsers service', () => {
  test('Valid request for public leagues returns data', ArrayTest(
    service, { user: 1, params: { leagueID: 1 }, body: {} },
    [],
  ));

  test('Valid request for private leagues returns data', ArrayTest(
    service, { user: 1, params: { leagueID: 2 }, body: {} },
    ['bot', 'bot'],
  ));

  test('Invalid request from private league returns error 403', ErrorTest(
    service, { user: 3, params: { leagueID: 2 }, body: {} },
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
