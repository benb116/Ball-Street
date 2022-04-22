import BaseAPI from '../../../helpers/api';
import { TradeAsk, TradeBid } from './Trades.types';

const TradesAPI = BaseAPI.injectEndpoints({
  endpoints: (build) => ({
    getTrades: build.query<(TradeBid | TradeAsk)[], string>({
      query: (contestID) => `/api/contests/${contestID}/trades`,
      providesTags: ['Trades'],
    }),
  }),
});

export const { useGetTradesQuery } = TradesAPI;

export default TradesAPI;
