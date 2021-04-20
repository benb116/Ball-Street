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

export {
  getentryfunc,
  preaddfunc,
  predropfunc,
};
