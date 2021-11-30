const service = require('../services/preTradeDrop.service');
const { ErrorTest, ObjectTest } = require('../../util/util');

describe('preTradeDrop service', () => {
  test('Valid request returns data', ObjectTest(
    service, {
      user: 2,
      params: { contestID: 2 },
      body: {
        nflplayerID: 32398,
      },
    },
    {
      ContestId: 2,
      DEF1: null,
      FLEX1: null,
      FLEX2: null,
      K1: 30266,
      QB1: null,
      RB1: 31885,
      RB2: null,
      TE1: null,
      UserId: 2,
      WR1: null,
      WR2: 28026,
      pointtotal: 2600,
    },
  ));

  test('Duplicate drop returns error 406', ErrorTest(
    service, {
      user: 2,
      params: { contestID: 2 },
      body: {
        nflplayerID: 31019,
      },
    },
    406, 'Player is not on roster',
  ));

  test('Predrop with price returns error 400', ErrorTest(
    service, {
      user: 2,
      params: { contestID: 2 },
      body: {
        nflplayerID: 29360,
        price: 100,
      },
    },
    400, 'Price not allowed in pretrade',
  ));

  test('No entry returns error 404', ErrorTest(
    service, {
      user: 4,
      params: { contestID: 2 },
      body: {
        nflplayerID: 31019,
      },
    },
    404, 'No entry found',
  ));

  test('Missing contestID returns error 400', ErrorTest(
    service, {
      user: 1,
      params: { },
      body: {
        nflplayerID: 31019,
      },
    },
    400, 'Please specify a contest',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, {
      params: { contestID: 2 },
      body: {
        nflplayerID: 31019,
      },
    },
    400, 'You must be logged in',
  ));

  test('Not pre games returns error 406', ErrorTest(
    service, {
      user: 2,
      params: { contestID: 2 },
      body: {
        nflplayerID: 30266,
      },
    },
    406, "Can't drop during or after games",
  ));
});
