import thunkReq from '../../helpers/thunkReqWrapper';

// Get all contests
function getcontestsfunc(_a={}, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', '/app/api/contests/');
}
// Get a specific contest
function getcontestfunc(input: { contestID: string }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/contests/${input.contestID}/`);
}
// Get my entry in a contest
function getmyentryfunc(input: { contestID: string }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/contests/${input.contestID}/entry`);
}
// Get all entries in a contest
function getentriesfunc(input: { contestID: string }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/contests/${input.contestID}/entries`);
}

// Make an entry in a contest
function createentryfunc(input: { contestID: string }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', `/app/api/contests/${input.contestID}/entry`);
}

export {
  getcontestsfunc,
  getcontestfunc,
  getentriesfunc,
  createentryfunc,
  getmyentryfunc,
};
