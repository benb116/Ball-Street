import service from '../services/createEntry.service';
import { ErrorTest, ObjectTest } from '../../util/util.tests';

describe('createEntry service', () => {
  test('Valid request returns data', ObjectTest(
    service, { user: 4, params: { contestID: 3 }, body: {} },
    {
      ContestId: 3,
      DEF1: null,
      FLEX1: null,
      FLEX2: null,
      K1: null,
      QB1: null,
      RB1: null,
      RB2: null,
      TE1: null,
      UserId: 4,
      WR1: null,
      WR2: null,
      pointtotal: 10000,
    },
    'DELETE from "Entries" WHERE "ContestId"=3 AND "UserId"=1;',
  ));

  test('Duplicate entry returns error 406', ErrorTest(
    service, { user: 1, params: { contestID: 1 }, body: {} },
    406, 'An entry already exists',
  ));

  test('Missing contestID returns error 400', ErrorTest(
    service, { user: 1, params: { }, body: {} },
    400, 'Please specify a contest',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, { params: { contestID: 2 }, body: {} },
    400, 'You must be logged in',
  ));

  test('Non-existent contest returns error 404', ErrorTest(
    service, { user: 1, params: { contestID: 80 }, body: {} },
    404, 'No contest found',
  ));
});
