import thunkReq from '../../helpers/thunkReqWrapper';

function getuserleaguesfunc(body, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', '/app/api/leagues/');
}
function getpublicleaguesfunc(body, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', '/app/api/leagues/public/');
}
function getleaguefunc(leagueID, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/leagues/${leagueID}`);
}
function getcontestsfunc(leagueID, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/leagues/${leagueID}/contests`);
}
function getleaguemembersfunc(leagueID, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/leagues/${leagueID}/members`);
}

function createleaguefunc({ name }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', '/app/api/leagues/league', JSON.stringify({ name }));
}
function addmemberfunc({ leagueID, email }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', `/app/api/leagues/${leagueID}/addMember`, JSON.stringify({ email }));
}
function createcontestfunc({ leagueID, name, budget }, thunkAPI) {
  thunkReq(thunkAPI, 'POST', `/app/api/leagues/${leagueID}/contests/contest`, JSON.stringify({ name, budget }));
}

export {
  getuserleaguesfunc,
  getpublicleaguesfunc,
  createleaguefunc,
  getleaguefunc,
  getcontestsfunc,
  getleaguemembersfunc,
  addmemberfunc,
  createcontestfunc,
};
