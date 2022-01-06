import thunkReq from '../../../helpers/thunkReqWrapper';

// Get all players
function getplayersfunc(_a: {}, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', '/app/api/nfldata/');
}

// Get all games
function getgamesfunc(_a: {}, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', '/app/api/nfldata/games');
}

export {
  getplayersfunc,
  getgamesfunc,
};
