import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { getentryfunc, preaddfunc, predropfunc } from './Entry.api'

export const getEntry = createAsyncThunk('entry/getEntry', getentryfunc);
export const preAdd = createAsyncThunk('entry/preAdd', preaddfunc);
export const preDrop = createAsyncThunk('entry/preDrop', predropfunc);

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
      setEntry(state, payload);
    },
    [preAdd.fulfilled]: (state, {payload}) => {
      setEntry(state, payload);
    },
    [preDrop.fulfilled]: (state, {payload}) => {
      setEntry(state, payload);
    }
  },
});

function setEntry (state, payload) {
  state.balance = payload.pointtotal;
  const rost = Object.assign({}, payload);
  delete rost.pointtotal;
  delete rost.UserId;
  delete rost.ContestId;
  delete rost.createdAt;
  delete rost.updatedAt;
  state.roster = rost;
  return state;
}

export const { } = entrySlice.actions;

export const entrySelector = (state) => state.entry;
export const isOnRosterSelector = (playerID) => {
  return (state) => {
    return (Object.values(state.entry.roster).indexOf(playerID) >= 0);
  }
}