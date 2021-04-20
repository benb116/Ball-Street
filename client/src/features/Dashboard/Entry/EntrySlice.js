/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import { getentryfunc, preaddfunc, predropfunc } from './Entry.api';

export const getEntry = createAsyncThunk('entry/getEntry', getentryfunc);
export const preAdd = createAsyncThunk('entry/preAdd', preaddfunc);
export const preDrop = createAsyncThunk('entry/preDrop', predropfunc);

const defaultState = {
  balance: 0,
  roster: {},
  rosterUpdate: false,
};

export const entrySlice = createSlice({
  name: 'entry',
  initialState: defaultState,
  reducers: {
    clear: (state) => {
      state = defaultState;
    },
    updateRoster: (state) => {
      toast.success('Offer filled');
      state.rosterUpdate = true;
    },
  },
  extraReducers: {
    [getEntry.fulfilled]: (state, { payload }) => {
      setEntry(state, payload);
      state.rosterUpdate = false;
    },
    [preAdd.fulfilled]: (state, { payload }) => {
      setEntry(state, payload);
    },
    [preAdd.rejected]: (state, { payload }) => {
      toast.error(payload);
    },
    [preDrop.fulfilled]: (state, { payload }) => {
      setEntry(state, payload);
    },
    [preDrop.rejected]: (state, { payload }) => {
      toast.error(payload);
    },
  },
});

function setEntry(state, payload) {
  state.balance = payload.pointtotal;
  const rost = { ...payload };
  delete rost.pointtotal;
  delete rost.UserId;
  delete rost.ContestId;
  delete rost.createdAt;
  delete rost.updatedAt;
  state.roster = rost;
  return state;
}

export const { updateRoster } = entrySlice.actions;

export const entrySelector = (state) => state.entry;
export const rosterUpdateSelector = (state) => state.entry.rosterUpdate;
export const isOnRosterSelector = (playerID) => (state) => (
  Object.values(state.entry.roster).indexOf(playerID) >= 0
);
