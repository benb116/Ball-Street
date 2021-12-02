import thunkReq from '../../../helpers/thunkReqWrapper';

function getentryfunc({ contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/contests/${contestID}/entry`);
}
function preaddfunc({ contestID, nflplayerID }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', `/app/api/contests/${contestID}/add`, JSON.stringify({ nflplayerID }));
}
function predropfunc({ contestID, nflplayerID }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', `/app/api/contests/${contestID}/drop`, JSON.stringify({ nflplayerID }));
}
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
