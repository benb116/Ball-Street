import { ErrorTest, ObjectTest } from '../../util/util.tests';
import service from '../services/createOffer.service';

describe('createOffer service', () => {
  test('Valid request returns data', ObjectTest(
    service,
    {
      user: 1,
      params: { contestID: 2 },
      body: {
        nflplayerID: 31885,
        isbid: false,
        price: 2000,
      },
    },
    {
      id: expect.stringContaining('-'),
      ContestId: 2,
      NFLPlayerId: 31885,
      UserId: 1,
      cancelled: false,
      filled: false,
      isbid: false,
      price: 2000,
      protected: false,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    },
    'DELETE from "Offers" WHERE "ContestId"=2 AND "UserId"=1 AND "NFLPlayerId"=31885;',
  ));

  test('Duplicate offer returns error 406', ErrorTest(
    service,
    {
      user: 2,
      params: { contestID: 2 },
      body: {
        nflplayerID: 31885,
        isbid: false,
        price: 2000,
      },
    },
    406,
    'An offer already exists for this player',
  ));

  test('Insufficient funds returns error 402', ErrorTest(
    service,
    {
      user: 1,
      params: { contestID: 2 },
      body: {
        nflplayerID: 31221,
        isbid: true,
        price: 20000,
      },
    },
    402,
    "User doesn't have enough points to offer",
  ));

  test('Non-existent player returns 404', ErrorTest(
    service,
    {
      user: 1,
      params: { contestID: 2 },
      body: {
        nflplayerID: 99999,
        isbid: true,
        price: 1000,
      },
    },
    404,
    'Player not found',
  ));

  test('Bid existing returns error 409', ErrorTest(
    service,
    {
      user: 1,
      params: { contestID: 2 },
      body: {
        nflplayerID: 30266,
        isbid: true,
        price: 2000,
      },
    },
    409,
    'Player is on roster already',
  ));

  test('Ask non-existing returns error 404', ErrorTest(
    service,
    {
      user: 1,
      params: { contestID: 2 },
      body: {
        nflplayerID: 31221,
        isbid: false,
        price: 2000,
      },
    },
    404,
    'Player is not on roster',
  ));

  test('No open spots returns error 409', ErrorTest(
    service,
    {
      user: 1,
      params: { contestID: 2 },
      body: {
        nflplayerID: 28378,
        isbid: true,
        price: 200,
      },
    },
    409,
    'There are no spots this player could fit into',
  ));

  test('No entry returns error 404', ErrorTest(
    service,
    {
      user: 4,
      params: { contestID: 2 },
      body: {
        nflplayerID: 31885,
        isbid: false,
        price: 2000,
      },
    },
    404,
    'No entry found',
  ));

  test('Missing contestID returns error 400', ErrorTest(
    service,
    {
      user: 1,
      params: { },
      body: {
        nflplayerID: 31885,
        isbid: false,
        price: 2000,
      },
    },
    400,
    'Please specify a contest',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service,
    {
      params: { contestID: 2 },
      body: {
        nflplayerID: 31885,
        isbid: false,
        price: 2000,
      },
    },
    400,
    'You must be logged in',
  ));

  test('Not mid games returns error 406', ErrorTest(
    service,
    {
      user: 2,
      params: { contestID: 2 },
      body: {
        nflplayerID: 32231,
        isbid: true,
        price: 200,
      },
    },
    406,
    "Can't make an offer before or after games",
  ));
});
