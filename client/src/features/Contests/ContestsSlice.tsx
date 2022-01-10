/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import type { RootState } from '../../app/store';
import API from '../../helpers/api';
import { ContestItemType, EntryItemType, EntryType } from '../types';

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
    builder.addMatcher(API.endpoints.getContests.matchFulfilled, (state, { payload }) => {
      state.allcontests = payload;
    });
    builder.addMatcher(API.endpoints.getContests.matchRejected, (_state, { error }) => {
      if (error) { toast.error(error.message || 'Unknown error'); }
    });

    builder.addMatcher(API.endpoints.getContest.matchFulfilled, (state, { payload }) => {
      state.thiscontest = payload;
    });
    builder.addMatcher(API.endpoints.getContest.matchRejected, (_state, { error }) => {
      if (error) { toast.error(error.message || 'Unknown error'); }
    });

    builder.addMatcher(API.endpoints.getEntries.matchFulfilled, (state, { payload }) => {
      state.thiscontestentries = payload;
    });
    builder.addMatcher(API.endpoints.getEntries.matchRejected, (_state, { error }) => {
      if (error) { toast.error(error.message || 'Unknown error'); }
    });

    builder.addMatcher(API.endpoints.getEntry.matchFulfilled, (state, { payload }) => {
      state.thiscontestmyentry = payload;
    });

    builder.addMatcher(API.endpoints.createEntry.matchFulfilled, (state, { payload }) => {
      state.thiscontestentries.push(payload);
      state.thiscontestmyentry = payload;
    });
    builder.addMatcher(API.endpoints.createEntry.matchRejected, (_state, { error }) => {
      if (error) { toast.error(error.message || 'Unknown error'); }
    });
  },
});

export const contestsSelector = (state: RootState) => state.contests.allcontests;
export const contestSelector = (state: RootState) => state.contests.thiscontest;
export const entriesSelector = (state: RootState) => state.contests.thiscontestentries;
export const myEntrySelector = (state: RootState) => state.contests.thiscontestmyentry;
