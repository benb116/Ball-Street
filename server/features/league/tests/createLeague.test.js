const service = require('../services/createLeague.service');
const { ErrorTest, ObjectTest } = require('../../util/util');

describe('createLeague service', () => {
  test('Valid request for private league returns data', ObjectTest(
    service, { user: 2, params: { }, body: { name: 'PL 1' } },
    {
      adminId: 2, id: 4, ispublic: false, name: 'PL 1',
    },
  ));

  test('Duplicate league name returns error 406', ErrorTest(
    service, { user: 2, params: { }, body: { name: 'Ball Street' } },
    406, 'A league already exists with that name',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, { params: { }, body: { name: 'PL 1' } },
    400, 'You must be logged in',
  ));

  test('Missing name returns error 400', ErrorTest(
    service, { user: 2, params: { }, body: { } },
    400, 'Please specify a name',
  ));
});
