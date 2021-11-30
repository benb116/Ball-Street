import service from '../services/getNFLPlayer.service';
import { ErrorTest, ObjectTest } from '../../util/util';

describe('getNFLPlayer service', () => {
  test('Valid request for position player returns data', ObjectTest(
    service, { user: 2, params: { nflplayerID: 31885 }, body: {} },
    {
      NFLPositionId: 2,
      NFLTeamId: 21,
      id: 31885,
      name: 'Miles Sanders',
      postprice: 700,
      preprice: 1100,
      active: true,
    },
  ));

  test('Valid request for defense player returns data', ObjectTest(
    service, { user: 2, params: { nflplayerID: 1 }, body: {} },
    {
      NFLPositionId: 6,
      NFLTeamId: 1,
      id: 1,
      jersey: 0,
      name: 'Atlanta Falcons',
      postprice: 700,
      preprice: 1100,
      active: true,
    },
  ));

  test('Invalid nflplayerID returns error 400', ErrorTest(
    service, { user: 2, params: { nflplayerID: 'abc' }, body: {} },
    400, 'Player ID is invalid',
  ));

  test('Nonexistent nflplayerID returns error 404', ErrorTest(
    service, { user: 2, params: { nflplayerID: 12345678 }, body: {} },
    404, 'No player found',
  ));

  test('Missing nflplayerID returns error 400', ErrorTest(
    service, { user: 2, params: { }, body: {} },
    400, 'Please specify a player',
  ));

  test('Missing userID returns error 400', ErrorTest(
    service, { params: { nflplayerID: 2 }, body: {} },
    400, 'You must be logged in',
  ));
});