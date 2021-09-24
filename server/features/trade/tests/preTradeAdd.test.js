const service = require('../services/preTradeAdd.service');
const { ErrorTest, ObjectTest } = require('../../util/util');

describe('preTradeAdd service', () => {
  test('Valid request returns data', ObjectTest(
    service, {
      user: 1,
      params: { leagueID: 2, contestID: 2 },
      body: {
        nflplayerID: 27648,
        rosterposition: 'TE1',
      },
    },
    {
      ContestId: 2,
      DEF1: 21,
      FLEX1: null,
      FLEX2: null,
      K1: 30266,
      QB1: null,
      RB1: 31885,
      RB2: null,
      TE1: 27648,
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
        nflplayerID: 31885,
        rosterposition: 'RB1',
      },
    },
    406, 'Player is on roster',
  ));

  test('Preadd with price returns error 400', ErrorTest(
    service, {
      user: 2,
      params: { leagueID: 2, contestID: 2 },
      body: {
        nflplayerID: 27631,
        rosterposition: 'RB1',
        price: 100,
      },
    },
    400, 'Price not allowed in pretrade',
  ));

  test('Insufficient funds returns error 402', ErrorTest(
    service, {
      user: 3,
      params: { leagueID: 2, contestID: 2 },
      body: {
        nflplayerID: 27648,
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
        nflplayerID: 31199,
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
        nflplayerID: 31199,
      },
    },
    406, 'There are no open spots',
  ));

  test('No entry returns error 404', ErrorTest(
    service, {
      user: 4,
      params: { leagueID: 2, contestID: 2 },
      body: {
        nflplayerID: 27648,
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
        nflplayerID: 27648,
        rosterposition: 'TE1',
      },
    },
    400, 'Please specify a contest',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, {
      params: { leagueID: 2, contestID: 2 },
      body: {
        nflplayerID: 27648,
        rosterposition: 'TE1',
      },
    },
    400, 'You must be logged in',
  ));

  test('Not pre games returns error 406', ErrorTest(
    service, {
      user: 1,
      params: { leagueID: 1, contestID: 1 },
      body: {
        nflplayerID: 31019,
        rosterposition: 'TE1',
      },
    },
    406, "Can't add during or after games",
  ));
});
