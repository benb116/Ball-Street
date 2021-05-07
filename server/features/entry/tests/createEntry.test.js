const service = require('../services/createEntry.service');
const { ErrorTest, ObjectTest } = require('../../util/util');

describe('createEntry service', () => {
  test('Valid request in private league returns data', ObjectTest(
    service, { user: 1, params: { leagueID: 2, contestID: 2 }, body: {} },
    {
      ContestId: 2,
      DEF1: null,
      FLEX1: null,
      FLEX2: null,
      K1: null,
      QB1: null,
      RB1: null,
      RB2: null,
      TE1: null,
      UserId: 1,
      WR1: null,
      WR2: null,
      pointtotal: 10000,
    },
  ));

  test('Non member request in private league returns error 403', ErrorTest(
    service, { user: 3, params: { leagueID: 2, contestID: 2 }, body: {} },
    403, 'You are not a member of that league',
  ));

  test('Missing leagueID returns error 400', ErrorTest(
    service, { user: 1, params: { contestID: 1 }, body: {} },
    400, 'Please specify a league',
  ));

  test('Missing contestID returns error 400', ErrorTest(
    service, { user: 1, params: { leagueID: 2 }, body: {} },
    400, 'Please specify a contest',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, { params: { leagueID: 2, contestID: 2 }, body: {} },
    400, 'You must be logged in',
  ));

  test('Non-existent league+contest returns error 406', ErrorTest(
    service, { user: 2, params: { leagueID: 2, contestID: 1 }, body: {} },
    406, 'Contest and league do not match',
  ));

  test('Non-existent league returns error 404', ErrorTest(
    service, { user: 1, params: { leagueID: 80, contestID: 1 }, body: {} },
    404, 'No league found',
  ));

  test('Non-existent contest returns error 404', ErrorTest(
    service, { user: 1, params: { leagueID: 1, contestID: 80 }, body: {} },
    404, 'No contest found',
  ));
});

// Cannot create contests in a public league
