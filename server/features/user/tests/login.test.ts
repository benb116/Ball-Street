import service from '../services/login.service';
import { ErrorTest, ObjectTest } from '../../util/util.tests';

describe('login service', () => {
  test('Valid request returns data', ObjectTest(
    service, { email: 'email1@gmail.com', password: 'password1' },
    { email: 'email1@gmail.com', id: 1, name: 'bot' },
  ));

  test('Needs verification', ObjectTest(
    service, { email: 'email6@gmail.com', password: 'password1' },
    { needsVerification: true },
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
