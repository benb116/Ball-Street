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
      state.balance = payload.pointtotal;
      const rost = Object.assign({}, payload);
      delete rost.pointtotal;
      delete rost.UserId;
      delete rost.ContestId;
      delete rost.createdAt;
      delete rost.updatedAt;
      state.roster = rost;
      state.roster["QB1"] = 40117;
    },
  },
});

export const { } = entrySlice.actions;

export const entrySelector = (state) => state.entry;
export const playerdataSelector = (state) => {
  
}