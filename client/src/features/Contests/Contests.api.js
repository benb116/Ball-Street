import thunkReq from "../../helpers/thunkReqWrapper";

const getcontestfunc = async({leagueID, contestID}, thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/api/leagues/'+leagueID+'/contests/'+contestID+'/');
const getmyentryfunc = async({leagueID, contestID}, thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/api/leagues/'+leagueID+'/contests/'+contestID+'/entry');
const getentriesfunc = async({leagueID, contestID}, thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/api/leagues/'+leagueID+'/contests/'+contestID+'/entries');

const createentryfunc = async({ leagueID, contestID }, thunkAPI) => {
  return thunkReq(thunkAPI, 'POST', '/app/api/leagues/'+leagueID+'/contests/'+contestID+'/entry', JSON.stringify({}));
};

export {
  getcontestfunc,
  getentriesfunc,
  createentryfunc,
  getmyentryfunc,
};