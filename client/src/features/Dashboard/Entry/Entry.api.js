import thunkReq from "../../../helpers/thunkReqWrapper";

const getentryfunc = async({leagueID, contestID}, thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/api/leagues/'+leagueID+'/contests/'+contestID+'/entry');

const preaddfunc = async({ leagueID, contestID, nflplayerID }, thunkAPI) => {
  return thunkReq(thunkAPI, 'POST', '/app/api/leagues/'+leagueID+'/contests/'+contestID+'/add', JSON.stringify({ nflplayerID }));
};

const predropfunc = async({ leagueID, contestID, nflplayerID }, thunkAPI) => {
  return thunkReq(thunkAPI, 'POST', '/app/api/leagues/'+leagueID+'/contests/'+contestID+'/drop', JSON.stringify({ nflplayerID }));
};

export {
  getentryfunc,
  preaddfunc,
  predropfunc,
};