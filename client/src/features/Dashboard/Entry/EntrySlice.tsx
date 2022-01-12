/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import type { RootState } from '../../../app/store';
import API from '../../../helpers/api';
import { ErrHandler } from '../../../helpers/util';

import {
  EntryType,
  NFLPosType,
  RosterPosType,
  RosterType,
} from '../../types';

interface EntryState {
  balance: number,
  roster: RosterType | Record<string, never>,
  rposSelected: [NFLPosType | 0, RosterPosType | ''],
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
    selectRPos: (state, { payload }: { payload: [NFLPosType | 0, RosterPosType | ''] }) => {
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
    builder.addMatcher(API.endpoints.getEntry.matchFulfilled, (state, { payload }) => {
      setEntry(state, payload);
      state.rosterUpdate = false;
    });
    builder.addMatcher(API.endpoints.preAdd.matchFulfilled, (state, { payload }) => {
      setEntry(state, payload);
    });
    builder.addMatcher(API.endpoints.preAdd.matchRejected, ErrHandler);
    builder.addMatcher(API.endpoints.preDrop.matchFulfilled, (state, { payload }) => {
      setEntry(state, payload);
    });
    builder.addMatcher(API.endpoints.preDrop.matchRejected, ErrHandler);
    builder.addMatcher(API.endpoints.reorderRoster.matchFulfilled, (state, { payload }) => {
      setEntry(state, payload);
    });
    builder.addMatcher(API.endpoints.reorderRoster.matchRejected, ErrHandler);
  },
});

function setEntry(state: EntryState, payload: EntryType) {
  state.balance = payload.pointtotal;
  const {
    pointtotal, UserId, ContestId, createdAt, updatedAt, ...rost
  } = payload;
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
