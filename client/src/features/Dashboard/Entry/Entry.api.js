import thunkReq from '../../../helpers/thunkReqWrapper';

// Get my entry in a contest
function getentryfunc({ contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/contests/${contestID}/entry`);
}
// Add a player in pregame
function preaddfunc({ contestID, nflplayerID }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', `/app/api/contests/${contestID}/add`, JSON.stringify({ nflplayerID }));
}
// Drop a player in pregame
function predropfunc({ contestID, nflplayerID }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', `/app/api/contests/${contestID}/drop`, JSON.stringify({ nflplayerID }));
}
// Move players around the roster (swap players in certain positions)
function reorderrosterfunc({
  contestID, pos1, pos2,
}, thunkAPI) {
  return thunkReq(thunkAPI, 'PUT', `/app/api/contests/${contestID}/entry`, JSON.stringify({ pos1, pos2 }));
}

export {
  getentryfunc,
  preaddfunc,
  predropfunc,
  reorderrosterfunc,
};
