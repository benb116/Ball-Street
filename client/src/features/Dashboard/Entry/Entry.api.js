import thunkReq from "../../../helpers/thunkReqWrapper";

const getentryfunc = async({leagueID, contestID}, thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/api/leagues/'+leagueID+'/contests/'+contestID+'/entry');

export {
  getentryfunc,
};