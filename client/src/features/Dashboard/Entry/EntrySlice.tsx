/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../../app/store';
import {
  getentryfunc, preaddfunc, predropfunc, reorderrosterfunc,
} from './Entry.api';

export const getEntry = createAsyncThunk('entry/getEntry', getentryfunc);
export const preAdd = createAsyncThunk('entry/preAdd', preaddfunc);
export const preDrop = createAsyncThunk('entry/preDrop', predropfunc);
export const reorderRoster = createAsyncThunk('entry/reorderRoster', reorderrosterfunc);

interface EntryState {
  balance: number,
  roster: Record<string, number>,
  rposSelected: [number, string],
  rosterUpdate: boolean,
}

const defaultState: EntryState = {
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  extraReducers: (builder) => {
    builder.addCase(getEntry.fulfilled, (state, { payload }) => {
      setEntry(state, payload);
      state.rosterUpdate = false;
    });
    builder.addCase(preAdd.fulfilled, (state, { payload }) => {
      setEntry(state, payload);
    });
    builder.addCase(preAdd.rejected, (state, { payload }) => {
      if (payload) { toast.error(payload as string); }
    });
    builder.addCase(preDrop.fulfilled, (state, { payload }) => {
      setEntry(state, payload);
    });
    builder.addCase(preDrop.rejected, (state, { payload }) => {
      if (payload) { toast.error(payload as string); }
    });
    builder.addCase(reorderRoster.fulfilled, (state, { payload }) => {
      setEntry(state, payload);
    });
    builder.addCase(reorderRoster.rejected, (state, { payload }) => {
      if (payload) { toast.error(payload as string); }
    });
  },
});

function setEntry(state: EntryState, payload) {
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

export const entrySelector = (state: RootState) => state.entry;
export const rosterUpdateSelector = (state: RootState) => state.entry.rosterUpdate;
export const isOnRosterSelector = (playerID: number) => (state: RootState) => (
  Object.values(state.entry.roster).indexOf(playerID) >= 0
);
export const rposSelector = (state: RootState) => state.entry.rposSelected;
