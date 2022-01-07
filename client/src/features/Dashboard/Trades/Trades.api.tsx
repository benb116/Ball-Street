import thunkReq from '../../../helpers/thunkReqWrapper';
import { TradeAsk, TradeBid } from '../../types';

// Get all midgame trades a user has made
async function gettradesfunc(input: { contestID: string }, thunkAPI) {
  return await thunkReq(thunkAPI, 'GET', `/app/api/contests/${input.contestID}/trades`) as (TradeBid | TradeAsk)[];
}

export default gettradesfunc;
