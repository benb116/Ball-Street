import thunkReq from '../../../helpers/thunkReqWrapper';

function getoffersfunc({ leagueID, contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/leagues/${leagueID}/contests/${contestID}/offers`);
}
function createofferfunc({ leagueID, contestID, offerobj }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', `/app/api/leagues/${leagueID}/contests/${contestID}/offer`, JSON.stringify({ offerobj }));
}
function cancelofferfunc({ leagueID, contestID, offerID }, thunkAPI) {
  return thunkReq(thunkAPI, 'DELETE', `/app/api/leagues/${leagueID}/contests/${contestID}/offer`, JSON.stringify({ offerID }));
}

export {
  getoffersfunc,
  createofferfunc,
  cancelofferfunc,
};
