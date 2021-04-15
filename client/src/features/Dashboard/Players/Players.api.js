import thunkReq from "../../../helpers/thunkReqWrapper";

const getplayersfunc = async({leagueID, contestID}, thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/api/nfldata/');

export {
  getplayersfunc,
}