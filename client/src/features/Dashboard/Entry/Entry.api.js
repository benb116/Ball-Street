import thunkReq from '../../../helpers/thunkReqWrapper';

function getentryfunc({ leagueID, contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/leagues/${leagueID}/contests/${contestID}/entry`);
}
function preaddfunc({ leagueID, contestID, nflplayerID }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', `/app/api/leagues/${leagueID}/contests/${contestID}/add`, JSON.stringify({ nflplayerID }));
}
function predropfunc({ leagueID, contestID, nflplayerID }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', `/app/api/leagues/${leagueID}/contests/${contestID}/drop`, JSON.stringify({ nflplayerID }));
}
function reorderrosterfunc({
  leagueID, contestID, pos1, pos2,
}, thunkAPI) {
  return thunkReq(thunkAPI, 'PUT', `/app/api/leagues/${leagueID}/contests/${contestID}/entry`, JSON.stringify({ pos1, pos2 }));
}

export {
  getentryfunc,
  preaddfunc,
  predropfunc,
  reorderrosterfunc,
};
