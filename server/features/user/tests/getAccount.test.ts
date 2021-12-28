import service from '../services/getAccount.service';
import { ErrorTest, ObjectTest } from '../../util/util.tests';

describe('getAccount service', () => {
  test('Valid request returns data', ObjectTest(
    service, { user: 1, params: {}, body: {} },
    { email: 'email1@gmail.com', id: 1, name: 'bot' },
  ));

  test('No user found', ErrorTest(
    service, { user: 80, params: {}, body: {} },
    404, 'User not found',
  ));

  test('Missing user returns error 400', ErrorTest(
    service, { params: {}, body: {} },
    400, 'You must be logged in',
  ));
});
