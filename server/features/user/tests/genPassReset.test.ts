import { verificationTokenLength } from '../../../config';
import { client } from '../../../db/redis';
import { ErrorTest } from '../../util/util.tests';
import service from '../services/genPassReset.service';

describe('genPassReset service', () => {
  test('Valid request returns confirmation and redis key', async () => {
    const output = await service({ email: 'abc123@gmail.com' });
    expect(output).toMatch(/^.*resetPassword.*$/);

    // Check to make sure the redis key was set
    const redisOutput = await client.KEYS('passReset:*');
    expect(redisOutput.length).toBeGreaterThan(0);
    const thekey = redisOutput[0];
    if (!thekey) return;
    const thetoken = thekey.split('passReset:')[1];
    if (!thetoken) return;
    expect(thetoken.length).toBe(verificationTokenLength);
    const thettl = await client.TTL(thekey).then(Number);
    expect(thettl).toBeGreaterThan(0);
  });

  test('Invalid email returns validation error', ErrorTest(service, { email: 'abc123' }, 400, 'Email is invalid'));
});
