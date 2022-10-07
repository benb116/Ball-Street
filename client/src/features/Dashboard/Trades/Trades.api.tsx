import BaseAPI from '@client/helpers/api';
import { TradeTree } from './Trades.types';

const TradesAPI = BaseAPI.injectEndpoints({
  endpoints: (build) => ({
    getTrades: build.query<TradeTree, string>({
      query: (contestID) => `/api/contests/${contestID}/trades`,
      providesTags: ['Trades'],
    }),
  }),
});

export const { useGetTradesQuery } = TradesAPI;

export default TradesAPI;
