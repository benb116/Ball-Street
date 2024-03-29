import { ErrorTest, ObjectTest } from '../../util/util.tests';
import service from '../services/getAccount.service';

describe('getAccount service', () => {
  test('Valid request returns data', ObjectTest(
    service,
    { user: 1, params: {}, body: {} },
    {
      email: 'email1@gmail.com',
      id: 1,
      name: 'bot',
      cash: 1000,
      verified: true,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    },
  ));

  test('No user found', ErrorTest(
    service,
    { user: 80, params: {}, body: {} },
    404,
    'User not found',
  ));

  test('Missing user returns error 400', ErrorTest(
    service,
    { params: {}, body: {} },
    400,
    'You must be logged in',
  ));
});
