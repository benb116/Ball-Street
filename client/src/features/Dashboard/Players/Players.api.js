import thunkReq from '../../../helpers/thunkReqWrapper';

function getplayersfunc(a, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', '/app/api/nfldata/');
}
export {
  // eslint-disable-next-line import/prefer-default-export
  getplayersfunc,
};
