const service = require('../services/getAccount.service');
const { ErrorTest, ObjectTest } = require('../../util/util');

describe('getAccount service', () => {
  test('Valid request returns data', ObjectTest(
    service, { user: 1 },
    { email: 'email1@gmail.com', id: 1, name: 'bot' },
  ));

  test('No user found', ErrorTest(
    service, { user: 80 },
    404, 'User not found',
  ));

  test('Missing user returns error 400', ErrorTest(
    service, { },
    400, 'You must be logged in',
  ));
});
