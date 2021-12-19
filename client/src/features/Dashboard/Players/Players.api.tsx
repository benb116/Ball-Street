import thunkReq from '../../../helpers/thunkReqWrapper';

// Get all players
function getplayersfunc(a, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', '/app/api/nfldata/');
}
// Get all games
function getgamesfunc(a, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', '/app/api/nfldata/games');
}

export {
  getplayersfunc,
  getgamesfunc,
};
