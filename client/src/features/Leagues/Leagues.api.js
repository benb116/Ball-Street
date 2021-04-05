import thunkReq from "../../helpers/thunkReqWrapper";

const getuserleaguesfunc = async(thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/api/leagues/');
const getpublicleaguesfunc = async(thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/api/leagues/public/');
const creatleaguefunc = async({ name, budget }, thunkAPI) => {
    return thunkReq(thunkAPI, 'POST', '/app/api/leagues/league', JSON.stringify({ name, budget }));
};

export {
  getuserleaguesfunc,
  getpublicleaguesfunc,
  creatleaguefunc,
};