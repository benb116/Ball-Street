const service = require('../services/createOffer.service');
const { ErrorTest, ObjectTest } = require('../../util/util');

describe('createOffer service', () => {
  test('Valid request returns data', ObjectTest(
    service, {
      user: 1,
      params: { leagueID: 2, contestID: 2 },
      body: {
        offerobj: {
          nflplayerID: 20933,
          isbid: false,
          price: 2000,
        },
      },
    },
    {
      ContestId: 2,
      NFLPlayerId: 20933,
      UserId: 1,
      cancelled: false,
      filled: false,
      isbid: false,
      price: 2000,
      protected: false,
    },
  ));

  test('Duplicate offer returns error 406', ErrorTest(
    service, {
      user: 2,
      params: { leagueID: 2, contestID: 2 },
      body: {
        offerobj: {
          nflplayerID: 20933,
          isbid: false,
          price: 2000,
        },
      },
    },
    406, 'An offer already exists for this player',
  ));

  test('Insufficient funds returns error 402', ErrorTest(
    service, {
      user: 1,
      params: { leagueID: 2, contestID: 2 },
      body: {
        offerobj: {
          nflplayerID: 21178,
          isbid: true,
          price: 20000,
        },
      },
    },
    402, "User doesn't have enough points to offer",
  ));

  test('Non-existent player returns 404', ErrorTest(
    service, {
      user: 1,
      params: { leagueID: 2, contestID: 2 },
      body: {
        offerobj: {
          nflplayerID: 99999,
          isbid: true,
          price: 1000,
        },
      },
    },
    404, 'Player not found',
  ));

  test('Bid existing returns error 409', ErrorTest(
    service, {
      user: 1,
      params: { leagueID: 2, contestID: 2 },
      body: {
        offerobj: {
          nflplayerID: 19041,
          isbid: true,
          price: 2000,
        },
      },
    },
    409, 'Player is on roster already',
  ));

  test('Ask non-existing returns error 404', ErrorTest(
    service, {
      user: 1,
      params: { leagueID: 2, contestID: 2 },
      body: {
        offerobj: {
          nflplayerID: 21178,
          isbid: false,
          price: 2000,
        },
      },
    },
    404, 'Player is not on roster',
  ));

  test('No open spots returns error 409', ErrorTest(
    service, {
      user: 1,
      params: { leagueID: 2, contestID: 2 },
      body: {
        offerobj: {
          nflplayerID: 17215,
          isbid: true,
          price: 2000,
        },
      },
    },
    409, 'There are no spots this player could fit into',
  ));

  test('No entry returns error 404', ErrorTest(
    service, {
      user: 4,
      params: { leagueID: 2, contestID: 2 },
      body: {
        offerobj: {
          nflplayerID: 20933,
          isbid: false,
          price: 2000,
        },
      },
    },
    404, 'No entry found',
  ));

  test('Missing contestID returns error 400', ErrorTest(
    service, {
      user: 1,
      params: { leagueID: 2 },
      body: {
        offerobj: {
          nflplayerID: 20933,
          isbid: false,
          price: 2000,
        },
      },
    },
    400, 'Please specify a contest',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, {
      params: { leagueID: 2, contestID: 2 },
      body: {
        offerobj: {
          nflplayerID: 20933,
          isbid: false,
          price: 2000,
        },
      },
    },
    400, 'You must be logged in',
  ));

  test('Not mid games returns error 406', ErrorTest(
    service, {
      user: 2,
      params: { leagueID: 2, contestID: 2 },
      body: {
        offerobj: {
          nflplayerID: 20876,
          isbid: false,
          price: 2000,
        },
      },
    },
    406, "Can't make an offer before or after games",
  ));
});
