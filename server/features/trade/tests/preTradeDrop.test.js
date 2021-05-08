const service = require('../services/preTradeDrop.service');
const { ErrorTest, ObjectTest } = require('../../util/util');

describe('preTradeDrop service', () => {
  test('Valid request in private league returns data', ObjectTest(
    service, {
      user: 2,
      params: { leagueID: 2, contestID: 2 },
      body: {
        nflplayerID: 19041,
      },
    },
    {
      ContestId: 2,
      DEF1: null,
      FLEX1: null,
      FLEX2: null,
      K1: null,
      QB1: null,
      RB1: 20933,
      RB2: null,
      TE1: null,
      UserId: 2,
      WR1: null,
      WR2: null,
      pointtotal: 1600,
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

  test('No entry returns error 404', ErrorTest(
    service, {
      user: 3,
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
});