/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const defaultState = {
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

export const leadersSelector = (state) => state.leaderboard.leaders;
