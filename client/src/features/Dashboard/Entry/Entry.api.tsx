import thunkReq from '../../../helpers/thunkReqWrapper';

// Get my entry in a contest
function getentryfunc(input: { contestID: string }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/contests/${input.contestID}/entry`);
}
// Add a player in pregame
function preaddfunc(input: { contestID: string, nflplayerID: number }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', `/app/api/contests/${input.contestID}/add`,
    { nflplayerID: input.nflplayerID });
}
// Drop a player in pregame
function predropfunc(input: { contestID: string, nflplayerID: number }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', `/app/api/contests/${input.contestID}/drop`,
    { nflplayerID: input.nflplayerID });
}
// Move players around the roster (swap players in certain positions)
function reorderrosterfunc(input: { contestID: string, pos1: string, pos2: string }, thunkAPI) {
  return thunkReq(thunkAPI, 'PUT', `/app/api/contests/${input.contestID}/entry`,
    { pos1: input.pos1, pos2: input.pos2 });
}

export {
  getentryfunc,
  preaddfunc,
  predropfunc,
  reorderrosterfunc,
};
