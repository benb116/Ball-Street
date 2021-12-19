/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import {
  getentryfunc, preaddfunc, predropfunc, reorderrosterfunc,
} from './Entry.api';

export const getEntry = createAsyncThunk('entry/getEntry', getentryfunc);
export const preAdd = createAsyncThunk('entry/preAdd', preaddfunc);
export const preDrop = createAsyncThunk('entry/preDrop', predropfunc);
export const reorderRoster = createAsyncThunk('entry/reorderRoster', reorderrosterfunc);

const defaultState = {
  balance: 0,
  roster: {},
  rposSelected: [0, ''], // Used for reordering roster. [NFLPositionID, RosterPosName]
  rosterUpdate: false, // Flag telling the entry to refresh
};

export const entrySlice = createSlice({
  name: 'entry',
  initialState: defaultState,
  reducers: {
    clear: (state) => {
      // eslint-disable-next-line no-unused-vars
      state = defaultState;
    },
    offerFilled: () => {
      toast.success('Offer filled');
    },
    updateRoster: (state) => {
      state.rosterUpdate = true;
    },
    selectRPos: (state, { payload }) => {
      // If current state is 0, nothing is currently selected.
      // This is the first click, so set the state
      if (state.rposSelected[0] === 0) {
        state.rposSelected = payload;
      } else {
        // A different position has previously been picked, so reset state
        state.rposSelected = [0, ''];
      }
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
      if (payload) { toast.error(payload); }
    },
    [preDrop.fulfilled]: (state, { payload }) => {
      setEntry(state, payload);
    },
    [preDrop.rejected]: (state, { payload }) => {
      if (payload) { toast.error(payload); }
    },
    [reorderRoster.fulfilled]: (state, { payload }) => {
      setEntry(state, payload);
    },
    [reorderRoster.rejected]: (state, { payload }) => {
      if (payload) { toast.error(payload); }
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

export const { offerFilled, updateRoster, selectRPos } = entrySlice.actions;

export const entrySelector = (state) => state.entry;
export const rosterUpdateSelector = (state) => state.entry.rosterUpdate;
export const isOnRosterSelector = (playerID) => (state) => (
  Object.values(state.entry.roster).indexOf(playerID) >= 0
);
export const rposSelector = (state) => state.entry.rposSelected;
