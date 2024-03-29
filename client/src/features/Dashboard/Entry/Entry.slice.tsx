/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import { RPosType, Roster, RosterPosIDType } from '../../../helpers/config';
import { ErrHandler } from '../../../helpers/util';
import ContestsAPI from '../../Contests/Contests.api';

import EntryAPI from './Entry.api';

import type { EntryType } from '../../../../../types/api/entry.api';
import type { RootState } from '../../../app/store';

interface EntryState {
  balance: number,
  roster: Record<RPosType, number | null>,
  rposSelected: [RosterPosIDType | 0, RPosType | ''],
}

const defaultState: EntryState = {
  balance: 0,
  roster: { ...Roster },
  rposSelected: [0, ''], // Used for reordering roster. [NFLPositionID, RosterPosName]
};

export const entrySlice = createSlice({
  name: 'entry',
  initialState: defaultState,
  reducers: {
    clear: (state) => {
      state = defaultState;
      return state;
    },
    offerFilled: () => {
      toast.success('Offer filled');
    },
    selectRPos: (state, { payload }: { payload: [RosterPosIDType | 0, RPosType | ''] }) => {
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
    builder.addMatcher(ContestsAPI.endpoints.getEntry.matchFulfilled, (state, { payload }) => {
      setEntry(state, payload);
    });
    builder.addMatcher(EntryAPI.endpoints.preAdd.matchFulfilled, (state, { payload }) => {
      setEntry(state, payload);
    });
    builder.addMatcher(EntryAPI.endpoints.preAdd.matchRejected, ErrHandler);
    builder.addMatcher(EntryAPI.endpoints.preDrop.matchFulfilled, (state, { payload }) => {
      setEntry(state, payload);
    });
    builder.addMatcher(EntryAPI.endpoints.preDrop.matchRejected, ErrHandler);
    builder.addMatcher(EntryAPI.endpoints.reorderRoster.matchFulfilled, (state, { payload }) => {
      setEntry(state, payload);
    });
    builder.addMatcher(EntryAPI.endpoints.reorderRoster.matchRejected, ErrHandler);
  },
});

function setEntry(state: EntryState, payload: EntryType) {
  state.balance = payload.pointtotal;
  const {
    pointtotal, UserId, ContestId, createdAt, updatedAt, projTotal, ...rost
  } = payload;
  state.roster = rost;
  return state;
}

export const { offerFilled, selectRPos } = entrySlice.actions;

export const entrySelector = (state: RootState) => state.entry;
export const isOnRosterSelector = (playerID: number) => (state: RootState) => (
  Object.values(state.entry.roster).indexOf(playerID) >= 0
);
export const rposSelector = (state: RootState) => state.entry.rposSelected;
