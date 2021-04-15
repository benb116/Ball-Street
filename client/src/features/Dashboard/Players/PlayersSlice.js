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
  sortProp: 'preprice',
  sortDesc: true,
};

export const playersSlice = createSlice({
  name: 'players',
  initialState: defaultState,
  reducers: {
    clear: state => state = {defaultState},
    setFilter: (state, action) => {
      console.log(action);
      state.filter[action.payload.name] = action.payload.value;
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

export const { clear, setFilter} = playersSlice.actions;

export const playersSelector = (state) => state.players.playerlist;
export const playerSelector = (playerID) => {
  return (state) => {
    return (state.players.playerlist.filter(p => p.id === playerID)[0] || {});
  }
}
export const filterSelector = (state) => state.players.filter;
