const service = require('../services/preTradeDrop.service');
const { ErrorTest, ObjectTest } = require('../../util/util');

describe('preTradeDrop service', () => {
  test('Valid request in private league returns data', ObjectTest(
    service, {
      user: 2,
      params: { leagueID: 2, contestID: 2 },
      body: {
        nflplayerID: 18686,
      },
    },
    {
      ContestId: 2,
      DEF1: null,
      FLEX1: null,
      FLEX2: null,
      K1: 19041,
      QB1: null,
      RB1: 20933,
      RB2: null,
      TE1: null,
      UserId: 2,
      WR1: null,
      WR2: null,
      pointtotal: 2600,
    },
  ));

  test('Duplicate drop returns error 406', ErrorTest(
    service, {
      user: 2,
      params: { leagueID: 2, contestID: 2 },
      body: {
        nflplayerID: 19415,
      },
    },
    406, 'Player is not on roster',
  ));

  test('Predrop with price returns error 400', ErrorTest(
    service, {
      user: 2,
      params: { leagueID: 2, contestID: 2 },
      body: {
        nflplayerID: 19415,
        price: 100,
      },
    },
    400, 'Price not allowed in pretrade',
  ));

  test('No entry returns error 404', ErrorTest(
    service, {
      user: 4,
      params: { leagueID: 2, contestID: 2 },
      body: {
        nflplayerID: 19415,
      },
    },
    404, 'No entry found',
  ));

  test('Missing contestID returns error 400', ErrorTest(
    service, {
      user: 1,
      params: { leagueID: 2 },
      body: {
        nflplayerID: 19415,
      },
    },
    400, 'Please specify a contest',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, {
      params: { leagueID: 2, contestID: 2 },
      body: {
        nflplayerID: 19415,
      },
    },
    400, 'You must be logged in',
  ));

  test('Not pre games returns error 406', ErrorTest(
    service, {
      user: 2,
      params: { leagueID: 2, contestID: 2 },
      body: {
        nflplayerID: 19041,
      },
    },
    406, "Can't drop during or after games",
  ));
});
