/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '@app/store';

interface LeaderState {
  projAverage: number
}
const defaultState: LeaderState = {
  projAverage: 0,
};

export const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState: defaultState,
  reducers: {
    updateAverage: (state, { payload }: { payload: number }) => {
      state.projAverage = payload;
    },
  },
  extraReducers: {},
});

export const { updateAverage } = leaderboardSlice.actions;

export const averageSelector = (state: RootState) => state.leaderboard.projAverage;
