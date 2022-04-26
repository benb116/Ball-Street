import BaseAPI from '../../../helpers/api';
import { EntryType } from './Entry.types';

const EntryAPI = BaseAPI.injectEndpoints({
  endpoints: (build) => ({
    preAdd: build.mutation<EntryType, { contestID: string, nflplayerID: number }>({
      query: ({ contestID, ...body }) => ({ url: `/api/contests/${contestID}/add`, method: 'POST', body }),
    }),
    preDrop: build.mutation<EntryType, { contestID: string, nflplayerID: number }>({
      query: ({ contestID, ...body }) => ({ url: `/api/contests/${contestID}/drop`, method: 'POST', body }),
    }),
    reorderRoster: build.mutation<EntryType, { contestID: string, pos1: string, pos2: string }>({
      query: ({ contestID, ...body }) => ({ url: `/api/contests/${contestID}/entry`, method: 'PUT', body }),
    }),
  }),
});

export const { usePreAddMutation, usePreDropMutation, useReorderRosterMutation } = EntryAPI;

export default EntryAPI;