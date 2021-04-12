import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { getentryfunc } from './Entry.api'

export const getEntry = createAsyncThunk('entry/getEntry', getentryfunc);

const defaultState = {
  balance: 0,
  roster: {},
};

export const entrySlice = createSlice({
  name: 'entry',
  initialState: defaultState,
  reducers: {
    clear: state => state = defaultState
  },
  extraReducers: {
    [getEntry.fulfilled]: (state, { payload }) => {
      console.log(payload)
      // state.userleagues = payload;
    },
  },
});

export const { } = entrySlice.actions;

export const entrySelector = (state) => state.dashboard.entry;
