import thunkReq from '../../../helpers/thunkReqWrapper';

// Get all players
function getplayersfunc(_a: unknown, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', '/app/api/nfldata/');
}

// Get all games
function getgamesfunc(_a: unknown, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', '/app/api/nfldata/games');
}

export {
  getplayersfunc,
  getgamesfunc,
};
