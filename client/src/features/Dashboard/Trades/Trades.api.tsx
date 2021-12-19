import thunkReq from '../../../helpers/thunkReqWrapper';

// Get all midgame trades a user has made
function gettradesfunc({ contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/contests/${contestID}/trades`);
}

export default gettradesfunc;
