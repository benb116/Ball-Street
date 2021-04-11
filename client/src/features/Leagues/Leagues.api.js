import thunkReq from "../../helpers/thunkReqWrapper";

const getuserleaguesfunc = async(thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/api/leagues/');
const getpublicleaguesfunc = async(thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/api/leagues/public/');
const createleaguefunc = async({ name, budget }, thunkAPI) => {
    return thunkReq(thunkAPI, 'POST', '/app/api/leagues/league', JSON.stringify({ name, budget }));
};
const getleaguefunc = async(leagueID, thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/api/leagues/'+leagueID);

const addmemberfunc = async({leagueID, email}, thunkAPI) => {
    console.log(email);
    return thunkReq(thunkAPI, 'POST', '/app/api/leagues/'+leagueID+'/addMember', JSON.stringify({ email }));
};

export {
  getuserleaguesfunc,
  getpublicleaguesfunc,
  createleaguefunc,
  getleaguefunc,
  addmemberfunc,
};