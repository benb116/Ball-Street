import thunkReq from '../../../helpers/thunkReqWrapper';

function getplayersfunc(a, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', '/app/api/nfldata/');
}

function getgamesfunc(a, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', '/app/api/nfldata/games');
}

export {
  getplayersfunc,
  getgamesfunc,
};
