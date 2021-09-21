/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import { getplayersfunc } from './Players.api';

export const getPlayers = createAsyncThunk('players/getPlayers', getplayersfunc);

const NFLPosTypes = {
  1: { name: 'QB', canflex: false },
  2: { name: 'RB', canflex: true },
  3: { name: 'WR', canflex: true },
  4: { name: 'TE', canflex: true },
  5: { name: 'K', canflex: false },
  6: { name: 'DEF', canflex: false },
};

const defaultState = {
  playerlist: [],
  priceMap: {},
  filter: {
    name: '',
    posName: '',
    teamAbr: '',
  },
  sortProp: 'preprice',
  sortDesc: true,
};

export const playersSlice = createSlice({
  name: 'players',
  initialState: defaultState,
  reducers: {
    clear: (state) => {
      // eslint-disable-next-line no-unused-vars
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
    setPhase: (state, { payload }) => {
      state.playerlist = state.playerlist.map((p) => {
        if (p.NFLTeam.id === payload.nflTeamID) {
          p.NFLTeam.gamePhase = payload.gamePhase;
        }
        return p;
      });
    },
  },
  extraReducers: {
    [getPlayers.fulfilled]: (state, { payload }) => {
      const np = payload.map((p) => {
        p.teamAbr = p.NFLTeam.abr;
        p.posName = NFLPosTypes[p.NFLPositionId].name;
        return p;
      });
      state.playerlist = np;
    },
    [getPlayers.rejected]: (state, { payload }) => {
      if (payload) { toast.error(payload); }
    },
  },
});

export const {
  clear, setFilter, setSort, updatePrices, setPhase,
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
export const priceMapSelector = (playerID) => (state) => (state.players.priceMap[playerID] || {});

export const pricesMapSelector = (playerIDs) => (state) => (
  playerIDs.reduce((acc, cur) => {
    const out = acc;
    out[cur] = (state.players.priceMap[cur] || {});
    return out;
  }, {})
);

export const filterSelector = (state) => state.players.filter;
export const sortSelector = (state) => {
  const { sortProp } = state.players;
  const { sortDesc } = state.players;
  return { sortProp, sortDesc };
};
