import thunkReq from '../../helpers/thunkReqWrapper';

function getcontestfunc({ leagueID, contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/leagues/${leagueID}/contests/${contestID}/`);
}
function getmyentryfunc({ leagueID, contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/leagues/${leagueID}/contests/${contestID}/entry`);
}
function getentriesfunc({ leagueID, contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/leagues/${leagueID}/contests/${contestID}/entries`);
}

function createentryfunc({ leagueID, contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', `/app/api/leagues/${leagueID}/contests/${contestID}/entry`, JSON.stringify({}));
}

export {
  getcontestfunc,
  getentriesfunc,
  createentryfunc,
  getmyentryfunc,
};
