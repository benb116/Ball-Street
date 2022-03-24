/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../../../app/store';

import { LeaderItemType } from './Leaderboard.types';

interface LeaderState {
  leaders: LeaderItemType[]
}
const defaultState: LeaderState = {
  leaders: [],
};

export const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState: defaultState,
  reducers: {
    updateLeaders: (state, { payload }: { payload: LeaderItemType[] }) => {
      state.leaders = (payload || []);
    },
  },
  extraReducers: {},
});

export const { updateLeaders } = leaderboardSlice.actions;

export const leadersSelector = (state: RootState) => state.leaderboard.leaders;
