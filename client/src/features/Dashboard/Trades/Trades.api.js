import thunkReq from '../../../helpers/thunkReqWrapper';

function gettradesfunc({ leagueID, contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/leagues/${leagueID}/contests/${contestID}/trades`);
}

export default gettradesfunc;
