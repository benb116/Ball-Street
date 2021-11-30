import service from '../services/cancelOffer.service'
import { ErrorTest, ObjectTest } from '../../util/util'

describe('cancelOffer service', () => {
  test('Valid request returns cancelled offer', ObjectTest(
    service, { user: 1, params: { contestID: 1 }, body: { offerID: '16c94b61-3c76-4078-8fbc-67fac7ed26c2' } },
    {
      ContestId: 1, NFLPlayerId: 31885, UserId: 1, cancelled: true, filled: false, id: '16c94b61-3c76-4078-8fbc-67fac7ed26c2', isbid: false, price: 8000, protected: false,
    },
  ));
  test('Already cancelled returns error 406', ErrorTest(
    service, { user: 2, params: { contestID: 1 }, body: { offerID: '16c94b61-3c76-4078-8fbc-67fac7ed26c3' } },
    406, 'Offer already cancelled',
  ));
  test('Already filled returns error 406', ErrorTest(
    service, { user: 3, params: { contestID: 1 }, body: { offerID: '16c94b61-3c76-4078-8fbc-67fac7ed26c4' } },
    406, 'Offer already filled',
  ));
  test('Other user returns error 403', ErrorTest(
    service, { user: 1, params: { contestID: 1 }, body: { offerID: '16c94b61-3c76-4078-8fbc-67fac7ed26c4' } },
    403, 'Unauthorized',
  ));
  test('Missing userID returns error 400', ErrorTest(
    service, { params: { contestID: 1 }, body: { offerID: '16c94b61-3c76-4078-8fbc-67fac7ed26c4' } },
    400, 'You must be logged in',
  ));

  test('Missing offerID returns error 400', ErrorTest(
    service, { user: 1, params: { contestID: 2 }, body: { } },
    400, 'Please specify a offer',
  ));
});
