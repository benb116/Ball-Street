import service from '../services/signup.service';
import { ErrorTest, ObjectTest } from '../../util/util';

describe('signup service', () => {
  test('Valid request returns data', ObjectTest(
    service, {
      name: 'Ben', email: '123@gmail.com', password: 'password1', skipVerification: true,
    },
    { email: '123@gmail.com', id: 7, name: 'Ben' },
  ));

  test('Valid request returns data', ObjectTest(
    service, {
      name: 'Ben', email: '1234@gmail.com', password: 'password1', skipVerification: false,
    },
    { needsVerification: true },
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
