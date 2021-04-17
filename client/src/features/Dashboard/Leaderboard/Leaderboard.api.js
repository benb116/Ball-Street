import thunkReq from "../../../helpers/thunkReqWrapper";

const getoffersfunc = async({leagueID, contestID}, thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/api/leagues/'+leagueID+'/contests/'+contestID+'/offers');

// NFLPlayerId: obj.nflplayerID,
// isbid: obj.isbid,
// price: obj.price,
// protected: obj.protected || config.DefaultProtected
const createofferfunc = async({ leagueID, contestID, offerobj }, thunkAPI) => {
  return thunkReq(thunkAPI, 'POST', '/app/api/leagues/'+leagueID+'/contests/'+contestID+'/offer', JSON.stringify({offerobj}));
};

const cancelofferfunc = async({ leagueID, contestID, offerID }, thunkAPI) => {
  return thunkReq(thunkAPI, 'DELETE', '/app/api/leagues/'+leagueID+'/contests/'+contestID+'/offer', JSON.stringify({ offerID }));
};

export {
  getoffersfunc,
  createofferfunc,
  cancelofferfunc,
};