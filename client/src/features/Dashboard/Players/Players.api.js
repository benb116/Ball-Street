import thunkReq from '../../../helpers/thunkReqWrapper';

function getplayersfunc({}, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', '/app/api/nfldata/');
}
export {
  getplayersfunc,
};
