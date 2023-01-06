import { ErrorTest, ObjectTest } from '../../util/util.tests';
import service from '../services/preTradeAdd.service';

describe('preTradeAdd service', () => {
  test('Valid request returns data', ObjectTest(
    service,
    {
      user: 1,
      params: { contestID: 2 },
      body: {
        nflplayerID: 17,
      },
    },
    {
      ContestId: 2,
      DEF1: 17,
      FLEX1: null,
      FLEX2: null,
      K1: 30266,
      QB1: null,
      RB1: 31885,
      RB2: null,
      TE1: 30213,
      UserId: 1,
      WR1: null,
      WR2: null,
      pointtotal: 8900,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    },
    'UPDATE "Entries" SET "DEF1"=null, "pointtotal"=10000 WHERE "ContestId"=2 AND "UserId"=1;',
  ));

  test('Duplicate add returns error 406', ErrorTest(
    service,
    {
      user: 2,
      params: { contestID: 2 },
      body: {
        nflplayerID: 31885,
      },
    },
    406,
    'Player is on roster',
  ));

  test('Preadd with price returns error 400', ErrorTest(
    service,
    {
      user: 2,
      params: { contestID: 2 },
      body: {
        nflplayerID: 27631,
        price: 100,
      },
    },
    400,
    'Price not allowed in pretrade',
  ));

  test('Insufficient funds returns error 402', ErrorTest(
    service,
    {
      user: 3,
      params: { contestID: 2 },
      body: {
        nflplayerID: 27648,
      },
    },
    402,
    "User doesn't have enough points",
  ));

  test('No open spots returns error 406', ErrorTest(
    service,
    {
      user: 1,
      params: { contestID: 2 },
      body: {
        nflplayerID: 31199,
      },
    },
    406,
    'There are no open spots',
  ));

  test('No entry returns error 404', ErrorTest(
    service,
    {
      user: 4,
      params: { contestID: 2 },
      body: {
        nflplayerID: 27648,
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
        nflplayerID: 27648,
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
        nflplayerID: 27648,
      },
    },
    400,
    'You must be logged in',
  ));

  test('Not pre games returns error 406', ErrorTest(
    service,
    {
      user: 1,
      params: { contestID: 1 },
      body: {
        nflplayerID: 31019,
      },
    },
    406,
    "Can't add during or after games",
  ));
});
