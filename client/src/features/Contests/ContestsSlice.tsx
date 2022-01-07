/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { RootState } from '../../app/store';

import {
  getcontestsfunc,
  getcontestfunc,
  getentriesfunc,
  createentryfunc,
  getmyentryfunc,
} from './Contests.api';

interface ContestItem {
  id: number,
  nflweek: number,
  name: string
}
interface EntryItem {
  UserId: number,
  pointtotal: number,
}
interface ContestsState {
  allcontests: ContestItem[],
  thiscontest: ContestItem | null,
  thiscontestentries: EntryItem[],
  thiscontestmyentry: EntryItem | null,
}
const defaultState: ContestsState = {
  allcontests: [],
  thiscontest: null,
  thiscontestentries: [],
  thiscontestmyentry: null,
};

export const getContests = createAsyncThunk('contests/getContests', getcontestsfunc);
export const getContest = createAsyncThunk('contests/getContest', getcontestfunc);
export const getEntries = createAsyncThunk('contests/getEntries', getentriesfunc);
export const getMyEntry = createAsyncThunk('contests/getMyEntry', getmyentryfunc);
export const createEntry = createAsyncThunk('contests/createEntry', createentryfunc);

export const contestsSlice = createSlice({
  name: 'contests',
  initialState: defaultState,
  reducers: {

  },
  extraReducers: (builder) => {
    builder.addCase(getContests.fulfilled, (state, { payload }) => {
      state.allcontests = payload;
    });
    builder.addCase(getContests.rejected, (state, { payload }) => {
      if (payload) { toast.error(payload); }
    });
    builder.addCase(getContest.fulfilled, (state, { payload }) => {
      state.thiscontest = payload;
    });
    builder.addCase(getContest.rejected, (state, { payload }) => {
      if (payload) { toast.error(payload); }
    });
    builder.addCase(getEntries.fulfilled, (state, { payload }) => {
      state.thiscontestentries = payload;
    });
    builder.addCase(getEntries.rejected, (state, { payload }) => {
      if (payload) { toast.error(payload); }
    });
    builder.addCase(getMyEntry.fulfilled, (state, { payload }) => {
      state.thiscontestmyentry = payload;
    });
    builder.addCase(createEntry.fulfilled, (state, { payload }) => {
      state.thiscontestentries.push(payload);
      state.thiscontestmyentry = payload;
    });
    builder.addCase(createEntry.rejected, (state, { payload }) => {
      if (payload) { toast.error(payload); }
    });
  },
});

export const contestsSelector = (state: RootState) => state.contests.allcontests;
export const contestSelector = (state: RootState) => state.contests.thiscontest;
export const entriesSelector = (state: RootState) => state.contests.thiscontestentries;
export const myEntrySelector = (state: RootState) => state.contests.thiscontestmyentry;
