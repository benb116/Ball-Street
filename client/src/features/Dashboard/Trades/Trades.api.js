import thunkReq from '../../../helpers/thunkReqWrapper';

function gettradesfunc({ contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/contests/${contestID}/trades`);
}

export default gettradesfunc;
