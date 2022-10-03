/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '@app/store';
import ContestsAPI from './Contests.api';
import { ErrHandler } from '@client/helpers/util';

import { ContestItemType } from './Contests.types';
import { EntryType, EntryItemType } from '../Dashboard/Entry/Entry.types';

interface ContestsState {
  allcontests: ContestItemType[],
  thiscontest: ContestItemType | null,
  thiscontestentries: EntryItemType[],
  thiscontestmyentry: EntryType | null,
}
const defaultState: ContestsState = {
  allcontests: [],
  thiscontest: null,
  thiscontestentries: [],
  thiscontestmyentry: null,
};

export const contestsSlice = createSlice({
  name: 'contests',
  initialState: defaultState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(ContestsAPI.endpoints.getContests.matchFulfilled, (state, { payload }) => {
      state.allcontests = payload;
    });
    builder.addMatcher(ContestsAPI.endpoints.getContests.matchRejected, ErrHandler);

    builder.addMatcher(ContestsAPI.endpoints.getContest.matchFulfilled, (state, { payload }) => {
      state.thiscontest = payload;
    });
    builder.addMatcher(ContestsAPI.endpoints.getContest.matchRejected, ErrHandler);

    builder.addMatcher(ContestsAPI.endpoints.getEntries.matchFulfilled, (state, { payload }) => {
      state.thiscontestentries = payload;
    });
    builder.addMatcher(ContestsAPI.endpoints.getEntries.matchRejected, ErrHandler);

    builder.addMatcher(ContestsAPI.endpoints.getEntry.matchFulfilled, (state, { payload }) => {
      state.thiscontestmyentry = payload;
    });
    builder.addMatcher(ContestsAPI.endpoints.getEntry.matchRejected, (state, resp) => {
      if (resp.payload?.status === 404) {
        state.thiscontestmyentry = null;
      } else {
        ErrHandler(state, resp);
      }
    });

    builder.addMatcher(ContestsAPI.endpoints.createEntry.matchFulfilled, (state, { payload }) => {
      state.thiscontestentries.push(payload);
      state.thiscontestmyentry = payload;
    });
    builder.addMatcher(ContestsAPI.endpoints.createEntry.matchRejected, ErrHandler);
  },
});

export const contestsSelector = (state: RootState) => state.contests.allcontests;
export const contestSelector = (state: RootState) => state.contests.thiscontest;
export const entriesSelector = (state: RootState) => state.contests.thiscontestentries;
export const myEntrySelector = (state: RootState) => state.contests.thiscontestmyentry;
