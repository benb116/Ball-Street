import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { getplayersfunc } from './Players.api'

export const getPlayers = createAsyncThunk('players/getPlayers', getplayersfunc);

const defaultState = {
  playerlist: [],
};

export const playersSlice = createSlice({
  name: 'players',
  initialState: defaultState,
  reducers: {
    clear: state => state = defaultState
  },
  extraReducers: {
    [getPlayers.fulfilled]: (state, { payload }) => {
      state.playerlist = payload;
    }
  },
});

export const { } = playersSlice.actions;

export const playersSelector = (state) => state.players.playerlist;
export const playerSelector = (playerID) => {
  return (state) => {
    return (state.players.playerlist.filter(p => p.id === playerID)[0] || {});
  }
}