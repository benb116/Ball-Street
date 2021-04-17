import thunkReq from "../../helpers/thunkReqWrapper";

const getuserleaguesfunc = async(body, thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/api/leagues/');
const getpublicleaguesfunc = async(body, thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/api/leagues/public/');
const createleaguefunc = async({ name, budget }, thunkAPI) => {
    return thunkReq(thunkAPI, 'POST', '/app/api/leagues/league', JSON.stringify({ name, budget }));
};
const getleaguefunc = async(leagueID, thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/api/leagues/'+leagueID);
const getcontestsfunc = async(leagueID, thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/api/leagues/'+leagueID+'/contests');
const getleaguemembersfunc = async(leagueID, thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/api/leagues/'+leagueID+'/members')

const addmemberfunc = async({leagueID, email}, thunkAPI) => {
    return thunkReq(thunkAPI, 'POST', '/app/api/leagues/'+leagueID+'/addMember', JSON.stringify({ email }));
};

const createcontestfunc = async({ leagueID, name }, thunkAPI) => {
  return thunkReq(thunkAPI, 'POST', '/app/api/leagues/'+leagueID+'/contests/contest', JSON.stringify({ name }));
};

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