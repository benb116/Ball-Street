import BaseAPI from '../../../helpers/api';
import type { TradeTree } from '../../../../../types/api/trade.api';

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
