import thunkReq from '../../../helpers/thunkReqWrapper';

// Get all midgame trades a user has made
function gettradesfunc(input: { contestID: string }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/contests/${input.contestID}/trades`);
}

export default gettradesfunc;
