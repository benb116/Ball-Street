import service from '../services/reorderRoster.service';
import { ErrorTest, ObjectTest } from '../../util/util.tests';

describe('reorderRoster service', () => {
  test('Valid request between same position returns data', ObjectTest(
    service, { user: 3, params: { contestID: 1 }, body: { pos1: 'RB1', pos2: 'RB2' } },
    {
      ContestId: 1,
      DEF1: null,
      FLEX1: null,
      FLEX2: null,
      K1: null,
      QB1: null,
      RB1: null,
      RB2: 31885,
      TE1: null,
      UserId: 3,
      WR1: null,
      WR2: null,
      pointtotal: 10000,
    },
  ));

  test('Valid request between FLEX returns data', ObjectTest(
    service, { user: 3, params: { contestID: 1 }, body: { pos1: 'RB2', pos2: 'FLEX1' } },
    {
      ContestId: 1,
      DEF1: null,
      FLEX1: 31885,
      FLEX2: null,
      K1: null,
      QB1: null,
      RB1: null,
      RB2: null,
      TE1: null,
      UserId: 3,
      WR1: null,
      WR2: null,
      pointtotal: 10000,
    },
  ));

  test('RB from FLEX to WR returns error', ErrorTest(
    service, { user: 3, params: { contestID: 1 }, body: { pos1: 'FLEX1', pos2: 'WR1' } },
    406, 'Cannot put that player in that position',
  ));

  test('Reset request returns data', ObjectTest(
    service, { user: 3, params: { contestID: 1 }, body: { pos1: 'FLEX1', pos2: 'RB1' } },
    {
      ContestId: 1,
      DEF1: null,
      FLEX1: null,
      FLEX2: null,
      K1: null,
      QB1: null,
      RB1: 31885,
      RB2: null,
      TE1: null,
      UserId: 3,
      WR1: null,
      WR2: null,
      pointtotal: 10000,
    },
  ));

  test('Request between disparate positions returns error 406', ErrorTest(
    service, { user: 3, params: { contestID: 1 }, body: { pos1: 'RB1', pos2: 'QB1' } },
    406, 'Cannot put that player in that position',
  ));

  test('Request for non-flex returns error 406', ErrorTest(
    service, { user: 3, params: { contestID: 1 }, body: { pos1: 'QB1', pos2: 'FLEX1' } },
    406, 'Cannot put a non-flex player in a flex position',
  ));

  test('Missing contestID returns error 400', ErrorTest(
    service, { user: 1, params: { }, body: { pos1: 'RB1', pos2: 'FLEX1' } },
    400, 'Please specify a contest',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, { params: { contestID: 1 }, body: { pos1: 'RB1', pos2: 'FLEX1' } },
    400, 'You must be logged in',
  ));

  test('Non-existent contest returns error 404', ErrorTest(
    service, { user: 1, params: { contestID: 80 }, body: { pos1: 'RB1', pos2: 'FLEX1' } },
    404, 'No entry found',
  ));
});
