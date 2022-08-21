import cryptoRandomString from 'crypto-random-string';
import service from '../services/evalVerify.service';
import { ErrorTest } from '../../util/util.tests';
import { verificationTimeout, verificationTokenLength } from '../../../config';
import emailVer from '../../../db/redis/emailVer.redis';

describe('evalVerify service', () => {
  test('Valid request returns confirmation and redis key', async () => {
    const email = 'email5@gmail.com';
    const rand = cryptoRandomString({ length: verificationTokenLength, type: 'url-safe' });
    await emailVer.set(rand, email, verificationTimeout * 60);

    const output = await service({ token: rand });
    expect(output).toEqual(expect.objectContaining({
      email: 'email5@gmail.com',
      id: 5,
      name: 'bot',
    }));
  });

  test('No token returns validation error', ErrorTest(service, { email: 'abc123' }, 400, 'Token is required'));
});
