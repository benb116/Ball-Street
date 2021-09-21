/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import { getgamesfunc, getplayersfunc } from './Players.api';

export const getPlayers = createAsyncThunk('players/getPlayers', getplayersfunc);
export const getGames = createAsyncThunk('players/getGames', getgamesfunc);

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
  gamelist: [],
  teamMap: {},
  priceMap: {},
  filter: {
    name: '',
    posName: '',
    teamAbr: '',
    game: '',
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
      const ns = state;
      payload.forEach((p) => {
        const pm = ns.priceMap[p.nflplayerID] || {};
        ns.priceMap[p.nflplayerID] = { ...(pm), ...p };
      });
      state = ns;
    },
    setPhase: (state, { payload }) => {
      state.gamelist = state.gamelist.map((g) => {
        if (g.HomeId === payload.nflTeamID || g.AwayId === payload.nflTeamID) {
          g.phase = payload.gamePhase;
          state.teamMap[payload.nflTeamID].phase = payload.gamePhase;
        }
        return g;
      });
    },
  },
  extraReducers: {
    [getPlayers.fulfilled]: (state, { payload }) => {
      const np = payload.map((p) => {
        p.posName = NFLPosTypes[p.NFLPositionId].name;
        return p;
      });
      state.playerlist = np;
    },
    [getPlayers.rejected]: (state, { payload }) => {
      if (payload) { toast.error(payload); }
    },
    [getGames.fulfilled]: (state, { payload }) => {
      state.gamelist = payload;
      state.teamMap = payload.reduce((acc, cur) => {
        acc[cur.away.id] = cur.away;
        acc[cur.away.id].phase = cur.phase;
        acc[cur.home.id] = cur.home;
        acc[cur.home.id].phase = cur.phase;
        return acc;
      }, {});
    },
    [getGames.rejected]: (state, { payload }) => {
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
export const allGamesSelector = (state) => (state.players.gamelist || []);
export const allTeamsSelector = (state) => (state.players.teamMap || {});
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
