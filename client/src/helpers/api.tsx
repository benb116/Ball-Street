// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ContestItemType } from '../features/Contests/Contests.types';
import { EntryItemType, EntryType } from '../features/Dashboard/Entry/Entry.types';
import { OfferItemType, OfferObj } from '../features/Dashboard/Offers/Offers.types';
import { GameItemType, PlayerItemType } from '../features/Dashboard/Players/Players.types';
import { TradeAsk, TradeBid } from '../features/Dashboard/Trades/Trades.types';
import { AccountType, SignupType } from '../features/User/User.types';

// Define a service using a base URL and expected endpoints
const API = createApi({
  reducerPath: 'API',
  baseQuery: fetchBaseQuery({ baseUrl: '/app' }),
  endpoints: (build) => ({
    // User
    getAccount: build.query<AccountType, void>({ query: () => '/auth/account' }),
    signup: build.mutation<SignupType, { name: string, email: string, password: string, skipVerification: boolean, }>({
      query: (body) => ({ url: '/auth/signup', method: 'POST', body }),
    }),
    login: build.mutation<SignupType, { email: string, password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    forgot: build.mutation<void, { email: string }>({
      query: (body) => ({ url: '/auth/forgot', method: 'POST', body }),
    }),
    reset: build.mutation<void, { token: string, password: string, confirmPassword: string }>({
      query: (body) => ({ url: '/auth/resetPasswordToken', method: 'POST', body }),
    }),
    logout: build.mutation<void, void>({ query: () => ({ url: '/auth/logout', method: 'DELETE' }) }),

    // Contests
    getContests: build.query<ContestItemType[], void>({ query: () => '/api/contests' }),
    getContest: build.query<ContestItemType, string>({ query: (contestID) => `/api/contests/${contestID}` }),
    getEntries: build.query<EntryItemType[], string>({ query: (contestID) => `/api/contests/${contestID}/entries` }),
    getEntry: build.query<EntryType, string>({ query: (contestID) => `/api/contests/${contestID}/entry` }),
    createEntry: build.mutation<EntryType, string>({
      query: (contestID) => ({ url: `/api/contests/${contestID}/entry`, method: 'POST' }),
    }),

    // Entries
    preAdd: build.mutation<EntryType, { contestID: string, nflplayerID: number }>({
      query: ({ contestID, ...body }) => ({ url: `/api/contests/${contestID}/add`, method: 'POST', body }),
    }),
    preDrop: build.mutation<EntryType, { contestID: string, nflplayerID: number }>({
      query: ({ contestID, ...body }) => ({ url: `/api/contests/${contestID}/drop`, method: 'POST', body }),
    }),
    reorderRoster: build.mutation<EntryType, { contestID: string, pos1: string, pos2: string }>({
      query: ({ contestID, ...body }) => ({ url: `/api/contests/${contestID}/reorder`, method: 'POST', body }),
    }),

    // Offers
    getOffers: build.query<OfferItemType[], string>({ query: (contestID) => `/api/contests/${contestID}/offers` }),
    createOffer: build.mutation<OfferItemType, { contestID: string, offerobj: OfferObj }>({
      query: ({ contestID, ...body }) => ({ url: `/api/contests/${contestID}/add`, method: 'POST', body }),
    }),
    cancelOffer: build.mutation<OfferItemType, { contestID: string, offerID: string }>({
      query: ({ contestID, ...body }) => ({ url: `/api/contests/${contestID}/drop`, method: 'POST', body }),
    }),

    // Players
    getPlayers: build.query<PlayerItemType[], void>({ query: () => '/api/nfldata' }),
    getGames: build.query<GameItemType[], void>({ query: () => '/api/nfldata/games' }),

    // Trades
    getTrades: build.query<(TradeBid | TradeAsk)[], string>({ query: (contestID) => `/api/contests/${contestID}/trades` }),
  }),
});

export default API;

export const {
  useGetAccountQuery,
  useLoginMutation,
  useLogoutMutation,
  useSignupMutation,
  useForgotMutation,
  useResetMutation,
} = API;
export const {
  useGetContestsQuery,
  useGetContestQuery,
  useGetEntriesQuery,
  useGetEntryQuery,
  useCreateEntryMutation,
} = API;
export const { usePreAddMutation, usePreDropMutation, useReorderRosterMutation } = API;
export const { useGetOffersQuery, useCreateOfferMutation, useCancelOfferMutation } = API;
export const { useGetPlayersQuery, useGetGamesQuery } = API;
export const { useGetTradesQuery } = API;
