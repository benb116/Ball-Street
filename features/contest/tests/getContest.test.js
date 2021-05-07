const service = require('../services/getContest.service');
const { ErrorTest, ObjectTest } = require('../../util/util');

describe('getContest service', () => {
  test('Request from public league returns data', ObjectTest(
    service, { user: 1, params: { leagueID: 1, contestID: 1 }, body: {} },
    {
      LeagueId: 1, budget: 10000, id: 1, name: 'Ball Street Big One', nflweek: 1,
    },
  ));

  test('Valid request from private league returns data', ObjectTest(
    service, { user: 1, params: { leagueID: 2, contestID: 3 }, body: {} },
    {
      LeagueId: 2, budget: 10000, id: 3, name: 'Private Contest', nflweek: 1,
    },
  ));

  test('Invalid request from private league returns error 403', ErrorTest(
    service, { user: 3, params: { leagueID: 2, contestID: 3 }, body: {} },
    403, 'You are not a member of that league',
  ));

  test('Missing contestID returns error 400', ErrorTest(
    service, { user: 2, params: { leagueID: 1 }, body: {} },
    400, 'Please specify a contest',
  ));

  test('Missing leagueID returns error 400', ErrorTest(
    service, { user: 2, params: { contestID: 1 }, body: {} },
    400, 'Please specify a league',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, { params: { leagueID: 1, contestID: 1 }, body: {} },
    400, 'You must be logged in',
  ));

  test('Non-existent league+contest returns error 400', ErrorTest(
    service, { params: { leagueID: 1, contestID: 1 }, body: {} },
    400, 'You must be logged in',
  ));

  test('Non-existent contest returns error 404', ErrorTest(
    service, { user: 1, params: { leagueID: 2, contestID: 2 }, body: {} },
    404, 'No contest found',
  ));

  test('Non-existent league returns error 404', ErrorTest(
    service, { user: 1, params: { leagueID: 3, contestID: 3 }, body: {} },
    404, 'No league found',
  ));
});
