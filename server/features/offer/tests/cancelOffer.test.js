const service = require('../services/cancelOffer.service');
const { ErrorTest, ObjectTest } = require('../../util/util');
const { set } = require('../../../db/redis');

beforeEach(() => {
  set.GamePhase('mid');
});

describe('cancelOffer service', () => {
  test('Valid request returns cancelled offer', ObjectTest(
    service, { user: 1, params: { leagueID: 1, contestID: 1 }, body: { offerID: '16c94b61-3c76-4078-8fbc-67fac7ed26c2' } },
    {
      ContestId: 1, NFLPlayerId: 20933, UserId: 1, cancelled: true, filled: false, id: '16c94b61-3c76-4078-8fbc-67fac7ed26c2', isbid: false, price: 8000, protected: false,
    },
  ));
  test('Already cancelled returns error 406', ErrorTest(
    service, { user: 2, params: { leagueID: 1, contestID: 1 }, body: { offerID: '16c94b61-3c76-4078-8fbc-67fac7ed26c3' } },
    406, 'Offer already cancelled',
  ));
  test('Already filled returns error 406', ErrorTest(
    service, { user: 3, params: { leagueID: 1, contestID: 1 }, body: { offerID: '16c94b61-3c76-4078-8fbc-67fac7ed26c4' } },
    406, 'Offer already filled',
  ));
  test('Other user returns error 403', ErrorTest(
    service, { user: 1, params: { leagueID: 1, contestID: 1 }, body: { offerID: '16c94b61-3c76-4078-8fbc-67fac7ed26c4' } },
    403, 'Unauthorized',
  ));
  test('Missing userID returns error 400', ErrorTest(
    service, { params: { leagueID: 1, contestID: 1 }, body: { offerID: '16c94b61-3c76-4078-8fbc-67fac7ed26c4' } },
    400, 'You must be logged in',
  ));

  test('Missing offerID returns error 400', ErrorTest(
    service, { user: 1, params: { leagueID: 2, contestID: 2 }, body: { } },
    400, 'Please specify a offer',
  ));

  test('Not mid games returns error 406', async () => {
    await set.GamePhase('pre');
    await ErrorTest(
      service, { user: 1, params: { leagueID: 1, contestID: 1 }, body: { offerID: '16c94b61-3c76-4078-8fbc-67fac7ed26c2' } },
      406, "Can't cancel an offer before or after games",
    )();
    await set.GamePhase('mid');
  });
});
