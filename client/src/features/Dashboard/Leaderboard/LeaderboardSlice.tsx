/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store';

interface LeaderState {
  leaders: Record<string, any>[]
}
const defaultState: LeaderState = {
  leaders: [],
};

export const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState: defaultState,
  reducers: {
    updateLeaders: (state, { payload }) => {
      state.leaders = (payload || []);
    },
  },
  extraReducers: {},
});

export const { updateLeaders } = leaderboardSlice.actions;

export const leadersSelector = (state: RootState) => state.leaderboard.leaders;
