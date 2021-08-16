const service = require('../services/addMember.service');
const { ErrorTest, ObjectTest } = require('../../util/util');

describe('addMember service', () => {
  test('Valid request in private league returns data', ObjectTest(
    service, { user: 2, params: { leagueID: 2 }, body: { email: 'email5@gmail.com' } },
    { LeagueId: 2, UserId: 5, name: 'bot' },
  ));

  test('Invalid request in public league returns error 403', ErrorTest(
    service, { user: 2, params: { leagueID: 1 }, body: { email: 'test2@email.com' } },
    406, 'Cannot add others in a public league',
  ));

  test('Non admin request in private league returns error 403', ErrorTest(
    service, { user: 1, params: { leagueID: 2 }, body: { email: 'test4@email.com' } },
    403, 'You are not admin, cannot add new member',
  ));

  test('Non member request in private league returns error 403', ErrorTest(
    service, { user: 4, params: { leagueID: 2 }, body: { email: 'test3@email.com' } },
    403, 'You are not a member of that league',
  ));

  test('Missing leagueID returns error 400', ErrorTest(
    service, { user: 2, params: { }, body: { email: 'test5@email.com' } },
    400, 'Please specify a league',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, { params: { leagueID: 2 }, body: { email: 'test6@email.com' } },
    400, 'You must be logged in',
  ));

  test('Missing email returns error 400', ErrorTest(
    service, { user: 2, params: { leagueID: 2 }, body: { } },
    400, 'Please specify an email',
  ));

  test('Non-existent email returns error 400', ErrorTest(
    service, { user: 2, params: { leagueID: 2 }, body: { email: 'test7@email.com' } },
    404, 'No user found',
  ));

  test('Non-existent league returns error 404', ErrorTest(
    service, { user: 2, params: { leagueID: 80 }, body: { email: 'test8@email.com' } },
    404, 'No league found',
  ));
});
