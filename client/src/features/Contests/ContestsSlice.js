/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import {
  getcontestsfunc,
  getcontestfunc,
  getentriesfunc,
  createentryfunc,
  getmyentryfunc,
} from './Contests.api';

const defaultState = {
  allcontests: [],
  thiscontest: {},
  thiscontestentries: [],
  thiscontestmyentry: {},
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
  extraReducers: {
    [getContests.fulfilled]: (state, { payload }) => {
      state.allcontests = payload;
    },
    [getContests.rejected]: (state, { payload }) => {
      if (payload) { toast.error(payload); }
    },
    [getContest.fulfilled]: (state, { payload }) => {
      state.thiscontest = payload;
    },
    [getContest.rejected]: (state, { payload }) => {
      if (payload) { toast.error(payload); }
    },
    [getEntries.fulfilled]: (state, { payload }) => {
      state.thiscontestentries = payload;
    },
    [getEntries.rejected]: (state, { payload }) => {
      if (payload) { toast.error(payload); }
    },
    [getMyEntry.fulfilled]: (state, { payload }) => {
      state.thiscontestmyentry = payload;
    },
    [createEntry.fulfilled]: (state, { payload }) => {
      state.thiscontestentries.push(payload);
      state.thiscontestmyentry = payload;
    },
    [createEntry.rejected]: (state, { payload }) => {
      if (payload) { toast.error(payload); }
    },
  },
});

export const contestsSelector = (state) => state.contests.allcontests;
export const contestSelector = (state) => state.contests.thiscontest;
export const entriesSelector = (state) => state.contests.thiscontestentries;
export const myEntrySelector = (state) => state.contests.thiscontestmyentry;
