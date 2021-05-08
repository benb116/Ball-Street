const service = require('../services/joinLeague.service');
const { ErrorTest, ObjectTest } = require('../../util/util');

describe('joinLeague service', () => {
  test('Valid request in public league returns data', ObjectTest(
    service, { user: 4, params: { leagueID: 1 }, body: { } },
    { LeagueId: 1, UserId: 4 },
  ));

  test('Invalid request in private league returns error 403', ErrorTest(
    service, { user: 4, params: { leagueID: 2 }, body: { } },
    406, 'Cannot join private league',
  ));

  test('Missing leagueID returns error 400', ErrorTest(
    service, { user: 2, params: { }, body: { } },
    400, 'Please specify a league',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, { params: { leagueID: 2 }, body: { } },
    400, 'You must be logged in',
  ));

  test('Non-existent league returns error 404', ErrorTest(
    service, { user: 2, params: { leagueID: 80 }, body: { } },
    404, 'No league found',
  ));
});
