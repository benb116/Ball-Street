import BaseAPI from '../../../helpers/api';
import type { EntryType, PreTradeInputType, ReorderInputType } from '../../../../../types/api/entry.api';

const EntryAPI = BaseAPI.injectEndpoints({
  endpoints: (build) => ({
    preAdd: build.mutation<EntryType, { contestID: string, nflplayerID: number }>({
      query: ({ contestID, ...body }: PreTradeInputType) => ({ url: `/api/contests/${contestID}/add`, method: 'POST', body }),
      invalidatesTags: ['Trades'], // Fetch update trade list
    }),
    preDrop: build.mutation<EntryType, { contestID: string, nflplayerID: number }>({
      query: ({ contestID, ...body }: PreTradeInputType) => ({ url: `/api/contests/${contestID}/drop`, method: 'POST', body }),
      invalidatesTags: ['Trades'], // Fetch update trade list
    }),
    reorderRoster: build.mutation<EntryType, { contestID: string, pos1: string, pos2: string }>({
      query: ({ contestID, ...body }: ReorderInputType) => ({ url: `/api/contests/${contestID}/entry`, method: 'PUT', body }),
    }),
  }),
});

export const { usePreAddMutation, usePreDropMutation, useReorderRosterMutation } = EntryAPI;

export default EntryAPI;
