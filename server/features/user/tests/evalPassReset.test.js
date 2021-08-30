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

  test('Bad password returns error', async () => {
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

    try {
      const o = await service({ token: rand, password: '1234567', confirmPassword: '1234567' });
      // eslint-disable-next-line no-console
      console.log(o);
      throw new Error('Unexpected pass');
    } catch (err) {
      // eslint-disable-next-line no-console
      if (!err.status) { console.log(err); }
      expect(err.message).toEqual('Password must be at least 8 characters long');
      expect(err.status).toEqual(400);
    }
  });

  test('Unequal confirm password returns error', async () => {
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

    try {
      const o = await service({ token: rand, password: '12345678', confirmPassword: '12345679' });
      // eslint-disable-next-line no-console
      console.log(o);
      throw new Error('Unexpected pass');
    } catch (err) {
      // eslint-disable-next-line no-console
      if (!err.status) { console.log(err); }
      expect(err.message).toEqual('Passwords do not match');
      expect(err.status).toEqual(403);
    }
  });

  test('No token returns validation error', ErrorTest(
    service, { email: 'abc123' }, 400, 'Token is required',
  ));
});
