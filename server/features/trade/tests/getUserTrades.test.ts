import service from '../services/getUserTrades.service';
import { ErrorTest, ObjectTest } from '../../util/util.tests';

describe('getUserTrades service', () => {
  test('Valid request returns data', ObjectTest(
    service, { user: 1, params: { contestID: 1 }, body: {} },
    {
      bids: [
        {
          price: 8000,
          bidId: '16c94b61-3c76-4078-8fbc-67fac7ed26c6',
          askId: '16c94b61-3c76-4078-8fbc-67fac7ed26c4',
          bid: {
            id: '16c94b61-3c76-4078-8fbc-67fac7ed26c6',
            isbid: true,
            price: 8000,
            protected: false,
            filled: true,
            cancelled: false,
            UserId: 1,
            ContestId: 1,
            NFLPlayerId: 31885,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ],
      asks: [],
      actions: [{
        id: '16c94b61-3c76-4078-8fbc-67fac7ed26e2',
        EntryActionKindId: 1,
        UserId: 1,
        ContestId: 1,
        NFLPlayerId: 31885,
        price: 1100,
        EntryActionKind: {
          id: 1,
          name: 'Add',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }],
    },
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
