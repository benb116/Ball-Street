const service = require('../services/getLeague.service');
const { ErrorTest, ObjectTest } = require('../../util/util');

describe('getLeague service', () => {
  test('Valid request from public league returns data', ObjectTest(
    service, { user: 1, params: { leagueID: 1 }, body: {} },
    {
      adminId: 1, id: 1, ispublic: true, name: 'Ball Street',
    },
  ));

  test('Valid request from private league returns data', ObjectTest(
    service, { user: 1, params: { leagueID: 2 }, body: {} },
    {
      adminId: 2, id: 2, ispublic: false, name: 'Ball Street Private',
    },
  ));

  test('Invalid request from private league returns error 403', ErrorTest(
    service, { user: 4, params: { leagueID: 2 }, body: {} },
    403, 'You are not a member of that league',
  ));

  test('Missing leagueID returns error 400', ErrorTest(
    service, { user: 2, params: { }, body: {} },
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
