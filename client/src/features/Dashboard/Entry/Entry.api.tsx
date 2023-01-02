import BaseAPI from '../../../helpers/api';
import type { EntryType, PreTradeQueryType, ReorderQueryType } from '../../../../../types/api/entry.api';

const EntryAPI = BaseAPI.injectEndpoints({
  endpoints: (build) => ({
    preAdd: build.mutation<EntryType, { contestID: string, nflplayerID: number }>({
      query: ({ contestID, ...body }: PreTradeQueryType) => ({ url: `/api/contests/${contestID}/add`, method: 'POST', body }),
      invalidatesTags: ['Trades'], // Fetch update trade list
    }),
    preDrop: build.mutation<EntryType, { contestID: string, nflplayerID: number }>({
      query: ({ contestID, ...body }: PreTradeQueryType) => ({ url: `/api/contests/${contestID}/drop`, method: 'POST', body }),
      invalidatesTags: ['Trades'], // Fetch update trade list
    }),
    reorderRoster: build.mutation<EntryType, { contestID: string, pos1: string, pos2: string }>({
      query: ({ contestID, ...body }: ReorderQueryType) => ({ url: `/api/contests/${contestID}/entry`, method: 'PUT', body }),
    }),
  }),
});

export const { usePreAddMutation, usePreDropMutation, useReorderRosterMutation } = EntryAPI;

export default EntryAPI;
