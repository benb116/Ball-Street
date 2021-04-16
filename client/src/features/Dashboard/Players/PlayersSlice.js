import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { getplayersfunc } from './Players.api'

export const getPlayers = createAsyncThunk('players/getPlayers', getplayersfunc);

const defaultState = {
  playerlist: [],
  filter: {
    name: "",
    posName: "",
    teamAbr: "",
  },
  sortProp: 'name',
  sortDesc: true,
};

export const playersSlice = createSlice({
  name: 'players',
  initialState: defaultState,
  reducers: {
    clear: state => state = {defaultState},
    setFilter: (state, action) => {
      state.filter[action.payload.name] = action.payload.value;
    },
    setSort: (state, action) => {
      console.log(action);
      if (state.sortProp === action.payload) {
        state.sortDesc = !state.sortDesc;
      } else {
        state.sortDesc = true;
      }
      state.sortProp = action.payload;
    }
  },
  extraReducers: {
    [getPlayers.fulfilled]: (state, { payload }) => {
      const np = payload.map(p => {
        p.teamAbr = p.NFLTeam.abr;
        p.posName = p.NFLPosition.name;
        return p;
      })
      state.playerlist = np;
    }
  },
});

export const { clear, setFilter, setSort} = playersSlice.actions;

export const playersSelector = (state) => state.players.playerlist;
export const playerSelector = (playerID) => {
  return (state) => {
    return (state.players.playerlist.filter(p => p.id === playerID)[0] || {});
  }
}
export const filterSelector = (state) => state.players.filter;
export const sortSelector = (state) => {
  const sortProp = state.players.sortProp
  const sortDesc = state.players.sortDesc;
  return {sortProp, sortDesc};
};