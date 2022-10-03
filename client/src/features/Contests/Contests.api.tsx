import BaseAPI from '@client/helpers/api';
import { ContestItemType } from './Contests.types';
import { EntryItemType, EntryType } from '../Dashboard/Entry/Entry.types';

const ContestsAPI = BaseAPI.injectEndpoints({
  endpoints: (build) => ({
    getContests: build.query<ContestItemType[], void>({ query: () => '/api/contests' }),
    getContest: build.query<ContestItemType, string>({ query: (contestID) => `/api/contests/${contestID}` }),
    getEntries: build.query<EntryItemType[], string>({ query: (contestID) => `/api/contests/${contestID}/entries` }),
    getEntry: build.query<EntryType, string>({
      query: (contestID) => `/api/contests/${contestID}/entry`,
      providesTags: ['Roster'], // Roster updates on trades and offer fills
    }),
    createEntry: build.mutation<EntryType, string>({
      query: (contestID) => ({ url: `/api/contests/${contestID}/entry`, method: 'POST' }),
      invalidatesTags: ['Account'], // Might reduce cash in account
    }),
  }),
});

export const {
  useGetContestsQuery,
  useGetContestQuery,
  useGetEntriesQuery,
  useGetEntryQuery,
  useCreateEntryMutation,
} = ContestsAPI;

export default ContestsAPI;
