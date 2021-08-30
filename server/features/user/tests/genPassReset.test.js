const { promisify } = require('util');
const service = require('../services/genPassReset.service');
const { ErrorTest } = require('../../util/util');

const { client } = require('../../../db/redis');
const config = require('../../../config');

const keys = promisify(client.keys).bind(client);
const ttl = promisify(client.ttl).bind(client);

describe('genPassReset service', () => {
  test('Valid request returns confirmation and redis key', async () => {
    const output = await service({ email: 'abc123@gmail.com' });
    expect(output).toMatch(/^.*resetPassword.*$/);

    // Check to make sure the redis key was set
    const redisOutput = await keys('passReset:*');
    expect(redisOutput.length).toBeGreaterThan(0);
    const thekey = redisOutput[0];
    expect(redisOutput[0].split('passReset:')[1].length).toBe(config.verificationTokenLength);
    const thettl = await ttl(thekey).then(Number);
    expect(thettl).toBeGreaterThan(0);
  });

  test('Invalid email returns validation error', ErrorTest(
    service, { email: 'abc123' }, 400, 'Email is invalid',
  ));
});
