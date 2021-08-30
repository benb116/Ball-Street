const { promisify } = require('util');
const cryptoRandomString = require('crypto-random-string');
const { client, set, rediskeys } = require('../../../db/redis');
const service = require('../services/evalPassReset.service');
const { ErrorTest } = require('../../util/util');
const config = require('../../../config');

const keys = promisify(client.keys).bind(client);
const ttl = promisify(client.ttl).bind(client);

describe('evalPassReset service', () => {
  test('Valid request returns confirmation and redis key', async () => {
    const email = 'email4@gmail.com';
    const rand = cryptoRandomString({ length: config.verificationTokenLength, type: 'url-safe' });
    await set.key(rediskeys.passReset(rand), email, 'EX', config.verificationTimeout * 60);

    // Check to make sure the redis key was set
    const redisOutput = await keys('passReset:*');
    expect(redisOutput.length).toBeGreaterThan(0);
    const thekey = redisOutput[0];
    expect(redisOutput[0].split('passReset:')[1].length).toBe(config.verificationTokenLength);
    const thettl = await ttl(thekey).then(Number);
    expect(thettl).toBeGreaterThan(0);

    const output = await service({ token: rand, password: '12345678', confirmPassword: '12345678' });
    expect(output).toBe(true);
  });

  test('No token returns validation error', ErrorTest(
    service, { email: 'abc123' }, 400, 'Token is required',
  ));
});
