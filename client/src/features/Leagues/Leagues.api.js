import thunkReq from "../../helpers/thunkReqWrapper";

const getuserleaguesfunc = async(thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/api/leagues/');
const getpublicleaguesfunc = async(thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/api/leagues/public/');

export {
  getuserleaguesfunc,
  getpublicleaguesfunc,
};