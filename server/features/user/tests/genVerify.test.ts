import { verificationTokenLength } from '../../../config';
import { client } from '../../../db/redis';
import { ErrorTest } from '../../util/util.tests';
import service from '../services/genVerify.service';

describe('genVerify service', () => {
  test('Valid request returns confirmation and redis key', async () => {
    const output = await service({ id: 6, email: 'abc123@gmail.com' });
    expect(output).toStrictEqual({ id: 6, needsVerification: true });

    // Check to make sure the redis key was set
    const redisOutput = await client.KEYS('emailVer:*');
    expect(redisOutput.length).toBeGreaterThan(0);
    const thekey = redisOutput[0];
    if (!thekey) return;
    const thetoken = thekey.split('emailVer:')[1];
    if (!thetoken) return;
    expect(thetoken.length).toBe(verificationTokenLength);
    const thettl = await client.TTL(thekey).then(Number);
    expect(thettl).toBeGreaterThan(0);
  });

  test(
    'Invalid email returns validation error',
    ErrorTest(service, { id: 6, email: 'abc123' }, 400, 'Email is invalid'),
  );
});
