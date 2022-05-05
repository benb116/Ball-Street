import service from '../services/forceLogout.service';
import { ErrorTest } from '../../util/util.tests';

import { client } from '../../../db/redis';

describe('forceLogout service', () => {
  test('Valid request returns confirmation and redis key', async () => {
    const obj1 = JSON.stringify({
      cookie: {
        originalMaxAge: null,
        expires: null,
        secure: false,
        httpOnly: true,
        path: '/',
        sameSite: true,
      },
      user: { id: 1 },
    });
    await client.set('sess:1234567', obj1);
    const obj2 = JSON.stringify({
      cookie: {
        originalMaxAge: null,
        expires: null,
        secure: false,
        httpOnly: true,
        path: '/',
        sameSite: true,
      },
      user: { id: 2 },
    });
    await client.set('sess:1234568', obj2);
    await service({ user: 1, params: {}, body: {} });
    const check1 = await client.get('sess:1234567');
    const check2 = await client.get('sess:1234568');
    expect(check1).toBe(null);
    expect(check2).toBe(obj2);
  });

  test('Invalid email returns validation error', ErrorTest(
    service, { }, 400, 'You must be logged in',
  ));
});
