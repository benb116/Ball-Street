const service = require('../services/reorderRoster.service');
const { ErrorTest, ObjectTest } = require('../../util/util');

describe('reorderRoster service', () => {
  test('Valid request between same position returns data', ObjectTest(
    service, { user: 3, params: { leagueID: 1, contestID: 1 }, body: { pos1: 'RB1', pos2: 'RB2' } },
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
    service, { user: 3, params: { leagueID: 1, contestID: 1 }, body: { pos1: 'RB2', pos2: 'FLEX1' } },
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

  test('Reset request returns data', ObjectTest(
    service, { user: 3, params: { leagueID: 1, contestID: 1 }, body: { pos1: 'FLEX1', pos2: 'RB1' } },
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
    service, { user: 3, params: { leagueID: 1, contestID: 1 }, body: { pos1: 'RB1', pos2: 'QB1' } },
    406, 'Cannot put that player in that position',
  ));

  test('Request for non-flex returns error 406', ErrorTest(
    service, { user: 3, params: { leagueID: 1, contestID: 1 }, body: { pos1: 'QB1', pos2: 'FLEX1' } },
    406, 'Cannot put a non-flex player in a flex position',
  ));

  test('Non member request in private league returns error 403', ErrorTest(
    service, { user: 4, params: { leagueID: 2, contestID: 2 }, body: { pos1: 'RB1', pos2: 'FLEX1' } },
    403, 'You are not a member of that league',
  ));

  test('Missing leagueID returns error 400', ErrorTest(
    service, { user: 1, params: { contestID: 1 }, body: { pos1: 'RB1', pos2: 'FLEX1' } },
    400, 'Please specify a league',
  ));

  test('Missing contestID returns error 400', ErrorTest(
    service, { user: 1, params: { leagueID: 1 }, body: { pos1: 'RB1', pos2: 'FLEX1' } },
    400, 'Please specify a contest',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, { params: { leagueID: 1, contestID: 1 }, body: { pos1: 'RB1', pos2: 'FLEX1' } },
    400, 'You must be logged in',
  ));

  test('Non-existent league+contest returns error 406', ErrorTest(
    service, { user: 2, params: { leagueID: 2, contestID: 1 }, body: { pos1: 'RB1', pos2: 'FLEX1' } },
    406, 'Contest and league do not match',
  ));

  test('Non-existent league returns error 404', ErrorTest(
    service, { user: 1, params: { leagueID: 81, contestID: 1 }, body: { pos1: 'RB1', pos2: 'FLEX1' } },
    404, 'No league found',
  ));

  test('Non-existent contest returns error 404', ErrorTest(
    service, { user: 1, params: { leagueID: 1, contestID: 80 }, body: { pos1: 'RB1', pos2: 'FLEX1' } },
    404, 'No contest found',
  ));
});
