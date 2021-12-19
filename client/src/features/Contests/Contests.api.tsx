import thunkReq from '../../helpers/thunkReqWrapper';

// Get all contests
function getcontestsfunc(a, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', '/app/api/contests/');
}
// Get a specific contest
function getcontestfunc({ contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/contests/${contestID}/`);
}
// Get my entry in a contest
function getmyentryfunc({ contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/contests/${contestID}/entry`);
}
// Get all entries in a contest
function getentriesfunc({ contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/contests/${contestID}/entries`);
}
// Make an entry in a contest
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
