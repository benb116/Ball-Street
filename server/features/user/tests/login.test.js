const service = require('../services/login.service');
const { ErrorTest, ObjectTest } = require('../../util/util');

describe('login service', () => {
  test('Valid request returns data', ObjectTest(
    service, { email: 'email1@gmail.com', password: 'password1' },
    { email: 'email1@gmail.com', id: 1, name: 'bot' },
  ));

  test('Incorrect email returns 401', ErrorTest(
    service, { email: '1235@gmail.com', password: 'password1' },
    401, 'Wrong username or password',
  ));

  test('Incorrect password returns 401', ErrorTest(
    service, { email: '123@gmail.com', password: 'password2' },
    401, 'Wrong username or password',
  ));

  test('Missing email returns error 400', ErrorTest(
    service, { password: 'password1' },
    400, 'Email is required',
  ));

  test('Missing password returns error 400', ErrorTest(
    service, { email: '123@gmail.com' },
    400, 'Password is required',
  ));
});