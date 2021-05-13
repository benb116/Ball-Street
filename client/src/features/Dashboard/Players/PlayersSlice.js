import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { getplayersfunc } from './Players.api';

export const getPlayers = createAsyncThunk('players/getPlayers', getplayersfunc);

const defaultState = {
  playerlist: [],
  priceMap: {},
  filter: {
    name: '',
    posName: '',
    teamAbr: '',
  },
  sortProp: 'name',
  sortDesc: true,
};

export const playersSlice = createSlice({
  name: 'players',
  initialState: defaultState,
  reducers: {
    clear: (state) => {
      state = defaultState;
    },
    setFilter: (state, action) => {
      state.filter[action.payload.name] = action.payload.value;
    },
    setSort: (state, action) => {
      if (state.sortProp === action.payload) {
        state.sortDesc = !state.sortDesc;
      } else {
        state.sortDesc = true;
      }
      state.sortProp = action.payload;
    },
    updatePrices: (state, { payload }) => {
      if (!payload.length) { payload = [payload]; }
      const ns = state;
      payload.forEach((p) => {
        const pm = ns.priceMap[p.nflplayerID] || {};
        ns.priceMap[p.nflplayerID] = { ...(pm), ...p };
      });
      state = ns;
    },
  },
  extraReducers: {
    [getPlayers.fulfilled]: (state, { payload }) => {
      const np = payload.map((p) => {
        p.teamAbr = p.NFLTeam.abr;
        p.posName = p.NFLPosition.name;
        return p;
      });
      state.playerlist = np;
    },
  },
});

export const {
  clear, setFilter, setSort, updatePrices,
} = playersSlice.actions;

export const allPlayersSelector = (state) => (
  state.players.playerlist.map((p) => ({ ...p, ...state.players.priceMap[p.id] }))
);
export const playerSelector = (playerID) => (state) => (
  state.players.playerlist.find((p) => p.id === playerID)
);
export const playersSelector = (playerIDs) => (state) => (
  state.players.playerlist.filter((p) => playerIDs.indexOf(p.id) > -1)
);
export const priceMapSelector = (playerID) => (state) => state.players.priceMap[playerID];

export const pricesMapSelector = (playerIDs) => (state) => (
  playerIDs.reduce((acc, cur) => {
    const out = acc;
    out[cur] = state.players.priceMap[cur];
    return out;
  }, {})
);

export const filterSelector = (state) => state.players.filter;
export const sortSelector = (state) => {
  const { sortProp } = state.players;
  const { sortDesc } = state.players;
  return { sortProp, sortDesc };
};
