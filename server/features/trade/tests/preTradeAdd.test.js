const service = require('../services/preTradeAdd.service');
const { ErrorTest, ObjectTest } = require('../../util/util');
const { set } = require('../../../db/redis');

beforeEach(() => {
  set.GamePhase('pre');
});

describe('preTradeAdd service', () => {
  test('Valid request returns data', ObjectTest(
    service, {
      user: 1,
      params: { leagueID: 2, contestID: 2 },
      body: {
        nflplayerID: 19415,
        rosterposition: 'TE1',
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
      TE1: 19415,
      UserId: 1,
      WR1: null,
      WR2: null,
      pointtotal: 8900,
    },
  ));

  test('Duplicate add returns error 406', ErrorTest(
    service, {
      user: 2,
      params: { leagueID: 2, contestID: 2 },
      body: {
        nflplayerID: 20933,
        rosterposition: 'RB1',
      },
    },
    406, 'Player is on roster',
  ));

  test('Insufficient funds returns error 402', ErrorTest(
    service, {
      user: 3,
      params: { leagueID: 2, contestID: 2 },
      body: {
        nflplayerID: 19067,
        rosterposition: 'FLEX1',
      },
    },
    402, "User doesn't have enough points",
  ));

  test('Player in spot returns error 406', ErrorTest(
    service, {
      user: 1,
      params: { leagueID: 2, contestID: 2 },
      body: {
        nflplayerID: 20033,
        rosterposition: 'K1',
      },
    },
    406, 'There is a player in that spot',
  ));

  test('No open spots returns error 406', ErrorTest(
    service, {
      user: 1,
      params: { leagueID: 2, contestID: 2 },
      body: {
        nflplayerID: 20033,
      },
    },
    406, 'There are no open spots',
  ));

  test('No entry returns error 404', ErrorTest(
    service, {
      user: 4,
      params: { leagueID: 2, contestID: 2 },
      body: {
        nflplayerID: 20933,
        rosterposition: 'TE1',
      },
    },
    404, 'No entry found',
  ));

  test('Missing contestID returns error 400', ErrorTest(
    service, {
      user: 1,
      params: { leagueID: 2 },
      body: {
        nflplayerID: 20933,
        rosterposition: 'TE1',
      },
    },
    400, 'Please specify a contest',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, {
      params: { leagueID: 2, contestID: 2 },
      body: {
        nflplayerID: 20933,
        rosterposition: 'TE1',
      },
    },
    400, 'You must be logged in',
  ));

  test('Not pre games returns error 406', async () => {
    await set.GamePhase('mid');
    await ErrorTest(
      service, {
        user: 1,
        params: { leagueID: 1, contestID: 1 },
        body: {
          nflplayerID: 20933,
          rosterposition: 'TE1',
        },
      },
      406, "Can't add during or after games",
    )();
    await set.GamePhase('pre');
  });
});
