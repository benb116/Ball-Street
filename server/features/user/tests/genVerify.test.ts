import service from '../services/genVerify.service';
import { ErrorTest } from '../../util/util.tests';

import { client } from '../../../db/redis';
import { verificationTokenLength } from '../../../config';

describe('genVerify service', () => {
  test('Valid request returns confirmation and redis key', async () => {
    const output = await service({ id: 6, email: 'abc123@gmail.com' });
    expect(output).toStrictEqual({ id: 6, needsVerification: true });

    // Check to make sure the redis key was set
    const redisOutput = await client.KEYS('emailVer:*');
    expect(redisOutput.length).toBeGreaterThan(0);
    const thekey = redisOutput[0];
    expect(redisOutput[0].split('emailVer:')[1].length).toBe(verificationTokenLength);
    const thettl = await client.TTL(thekey).then(Number);
    expect(thettl).toBeGreaterThan(0);
  });

  test('Invalid email returns validation error', ErrorTest(
    service, { id: 6, email: 'abc123' }, 400, 'Email is invalid',
  ));
});
