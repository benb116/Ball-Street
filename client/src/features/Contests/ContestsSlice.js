/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import {
  getcontestfunc,
  getentriesfunc,
  createentryfunc,
  getmyentryfunc,
} from './Contests.api';

const defaultState = {
  thiscontest: {},
  thiscontestentries: [],
  thiscontestmyentry: {},
};

export const getContest = createAsyncThunk('contests/getContest', getcontestfunc);
export const getEntries = createAsyncThunk('contests/getEntries', getentriesfunc);
export const getMyEntry = createAsyncThunk('contests/getMyEntry', getmyentryfunc);
export const createEntry = createAsyncThunk('leagues/createEntry', createentryfunc);

export const contestsSlice = createSlice({
  name: 'contests',
  initialState: defaultState,
  reducers: {

  },
  extraReducers: {
    [getContest.fulfilled]: (state, { payload }) => {
      state.thiscontest = payload;
    },
    [getEntries.fulfilled]: (state, { payload }) => {
      state.thiscontestentries = payload;
    },
    [getMyEntry.fulfilled]: (state, { payload }) => {
      state.thiscontestmyentry = payload;
    },
    [createEntry.fulfilled]: (state, { payload }) => {
      state.thiscontestentries.push(payload);
      state.thiscontestmyentry = payload;
    },
  },
});

export const contestSelector = (state) => state.contests.thiscontest;
export const entriesSelector = (state) => state.contests.thiscontestentries;
export const myEntrySelector = (state) => state.contests.thiscontestmyentry;
