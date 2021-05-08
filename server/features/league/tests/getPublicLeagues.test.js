const service = require('../services/getPublicLeagues.service');
const { ArrayTest } = require('../../util/util');

describe('getPublicLeagues service', () => {
  test('Valid request returns data', ArrayTest(
    service, { user: 1, params: { }, body: {} },
    [
      {
        id: 1,
        name: 'Ball Street',
        adminId: 1,
        ispublic: true,
      },
      {
        id: 3,
        name: 'Ball Street Public2',
        adminId: 1,
        ispublic: true,
      },
    ],
  ));
});

// Cannot create contests in a public league
