const service = require('../services/signup.service');
const { ErrorTest, ObjectTest } = require('../../util/util');

describe('signup service', () => {
  test('Valid request returns data', ObjectTest(
    service, { name: 'Ben', email: '123@gmail.com', password: 'password1' },
    { email: '123@gmail.com', id: 6, name: 'Ben' },
  ));

  test('Existing email returns 406', ErrorTest(
    service, { name: 'Ben', email: 'email1@gmail.com', password: 'password1' },
    406, 'An account with that email already exists',
  ));

  test('Missing email returns error 400', ErrorTest(
    service, { name: 'Ben', password: 'password1' },
    400, 'Email is required',
  ));

  test('Missing password returns error 400', ErrorTest(
    service, { name: 'Ben', email: '123@gmail.com' },
    400, 'Password is required',
  ));

  test('Missing name returns error 400', ErrorTest(
    service, { email: '123@gmail.com', password: 'password1' },
    400, 'Name is required',
  ));
});
