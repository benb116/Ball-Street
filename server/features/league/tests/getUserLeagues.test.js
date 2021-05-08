const service = require('../services/getUserLeagues.service');
const { ErrorTest, ArrayTest } = require('../../util/util');

describe('getUserLeagues service', () => {
  test('Valid request from member returns data', ArrayTest(
    service, { user: 1, params: {}, body: {} },
    [
      {
        id: 2,
        name: 'Ball Street Private',
        adminId: 2,
        ispublic: false,
      },
    ],
  ));

  test('Valid request from non-member returns empty', ArrayTest(
    service, { user: 4, params: {}, body: {} },
    [],
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, { params: { leagueID: 1 }, body: {} },
    400, 'You must be logged in',
  ));
});

// Cannot create contests in a public league
