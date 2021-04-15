import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import {
  getcontestfunc,
  getentriesfunc,
  createentryfunc,
} from './Contests.api';

const defaultState = {
  thiscontest: {},
  thiscontestentries: [],
}

export const getContest = createAsyncThunk('contests/getContest', getcontestfunc);
export const getEntries = createAsyncThunk('contests/getEntries', getentriesfunc);

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
    [createEntry.fulfilled]: (state, { payload }) => {
      state.thiscontestentries.push(payload);
    },
  },
});

export const {} = contestsSlice.actions;

export const contestSelector = (state) => state.contests.thiscontest;
export const entriesSelector = (state) => state.contests.thiscontestentries;
