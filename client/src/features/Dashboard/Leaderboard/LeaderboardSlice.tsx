/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../../app/store';

export interface LeaderItemType {
  id: number,
  user: number,
  total: number
}

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
    updateLeaders: (state, { payload }) => {
      state.leaders = (payload || []);
    },
  },
  extraReducers: {},
});

export const { updateLeaders } = leaderboardSlice.actions;

export const leadersSelector = (state: RootState) => state.leaderboard.leaders;
