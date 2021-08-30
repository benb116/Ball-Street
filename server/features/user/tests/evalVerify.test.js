const cryptoRandomString = require('crypto-random-string');
const { set, rediskeys } = require('../../../db/redis');
const service = require('../services/evalVerify.service');
const { ErrorTest } = require('../../util/util');
const config = require('../../../config');

describe('evalVerify service', () => {
  test('Valid request returns confirmation and redis key', async () => {
    const email = 'email5@gmail.com';
    const rand = cryptoRandomString({ length: config.verificationTokenLength, type: 'url-safe' });
    await set.key(rediskeys.emailVer(rand), email, 'EX', config.verificationTimeout * 60);

    const output = await service({ token: rand });
    expect(output).toEqual(expect.objectContaining({
      email: 'email5@gmail.com',
      id: 5,
      name: 'bot',
    }));
  });

  test('No token returns validation error', ErrorTest(
    service, { email: 'abc123' }, 400, 'Token is required',
  ));
});
