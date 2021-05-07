const service = require('../services/createContest.service');
const { ErrorTest, ObjectTest } = require('../../util/util');

describe('createContest service', () => {
  test('Valid request in private league returns data', ObjectTest(
    service, { user: 2, params: { leagueID: 2 }, body: { name: 'New Contest', budget: 10000 } },
    {
      id: 3, LeagueId: 2, name: 'New Contest', budget: 10000, nflweek: 1,
    },
  ));

  test('Invalid request in public league returns error 403', ErrorTest(
    service, { user: 1, params: { leagueID: 1 }, body: { name: 'New Contest 2', budget: 10000 } },
    403, 'Cannot create contests in a public league',
  ));

  test('Non member request in private league returns error 403', ErrorTest(
    service, { user: 3, params: { leagueID: 2 }, body: { name: 'New Contest 3', budget: 10000 } },
    403, 'You are not a member of that league',
  ));

  test('Non admin request in private league returns error 403', ErrorTest(
    service, { user: 1, params: { leagueID: 2 }, body: { name: 'New Contest 4', budget: 10000 } },
    403, 'Must be league admin to make new contests',
  ));

  test('Missing leagueID returns error 400', ErrorTest(
    service, { user: 2, params: { }, body: { name: 'New Contest 5', budget: 10000 } },
    400, 'Please specify a league',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, { params: { leagueID: 2 }, body: { name: 'New Contest 6', budget: 10000 } },
    400, 'You must be logged in',
  ));

  test('Missing name returns error 400', ErrorTest(
    service, { user: 2, params: { leagueID: 2 }, body: { budget: 10000 } },
    400, 'Please specify a name',
  ));

  test('Missing budget returns error 400', ErrorTest(
    service, { user: 2, params: { leagueID: 2 }, body: { name: 'New Contest 7' } },
    400, 'Please specify a budget',
  ));

  test('Non-existent league returns error 404', ErrorTest(
    service, { user: 1, params: { leagueID: 80 }, body: { name: 'New Contest 8', budget: 10000 } },
    404, 'No league found',
  ));
});

// Cannot create contests in a public league
