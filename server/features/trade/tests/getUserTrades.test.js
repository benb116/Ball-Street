const service = require('../services/getUserTrades.service');
const { ErrorTest, ArrayTest } = require('../../util/util');

describe('getUserTrades service', () => {
  test('Valid request returns data', ArrayTest(
    service, { user: 1, params: { contestID: 1 }, body: {} },
    [{
      askId: '16c94b61-3c76-4078-8fbc-67fac7ed26c4',
      bidId: '16c94b61-3c76-4078-8fbc-67fac7ed26c6',
      price: 8000,
    }],
  ));

  test('Missing contestID returns error 400', ErrorTest(
    service, { user: 2, params: { }, body: {} },
    400, 'Please specify a contest',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, { params: { contestID: 2 }, body: {} },
    400, 'You must be logged in',
  ));
});
