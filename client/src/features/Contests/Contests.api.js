import thunkReq from '../../helpers/thunkReqWrapper';

function getcontestsfunc(a, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', '/app/api/contests/');
}
function getcontestfunc({ contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/contests/${contestID}/`);
}
function getmyentryfunc({ contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/contests/${contestID}/entry`);
}
function getentriesfunc({ contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/contests/${contestID}/entries`);
}

function createentryfunc({ contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', `/app/api/contests/${contestID}/entry`, JSON.stringify({}));
}

export {
  getcontestsfunc,
  getcontestfunc,
  getentriesfunc,
  createentryfunc,
  getmyentryfunc,
};
