/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { string } from 'prop-types';
import toast from 'react-hot-toast';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../../app/store';
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

interface PlayerState {
  playerlist: Record<string, any>[],
  gamelist: Record<string, any>[],
  teamMap: Record<string, any>,
  priceMap: Record<string, any>,
  filter: {
    name: string,
    posName: string,
    teamAbr: string,
    game: string,
    phase: string,
  },
  sortProp: string,
  sortDesc: boolean,
}

const defaultState: PlayerState = {
  playerlist: [],
  gamelist: [],
  teamMap: {},
  priceMap: {},
  filter: { // obj showing all filters
    name: '',
    posName: '',
    teamAbr: '',
    game: '',
    phase: '',
  },
  sortProp: 'preprice', // current sort metric
  sortDesc: true,
};

export const playersSlice = createSlice({
  name: 'players',
  initialState: defaultState,
  reducers: {
    clear: (state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      state = defaultState;
    },
    setFilter: (state, action) => {
      state.filter[action.payload.name] = action.payload.value;
    },
    setSort: (state, action) => {
      if (state.sortProp === action.payload) { // If double click, change order
        state.sortDesc = !state.sortDesc;
      } else { // Set descending first
        state.sortDesc = true;
      }
      state.sortProp = action.payload; // Change sort property
    },
    updatePrices: (state, { payload }) => { // Update price info for a set of players
      const ns = state;
      payload.forEach((p) => {
        const pm = ns.priceMap[p.nflplayerID] || {};
        ns.priceMap[p.nflplayerID] = { ...(pm), ...p }; // Overwrite old values
      });
      state = ns;
    },
    setPhase: (state, { payload }) => { // Set the phase of a team to a new phase
      state.gamelist = state.gamelist.map((g) => {
        if (g.HomeId === payload.nflTeamID || g.AwayId === payload.nflTeamID) {
          g.phase = payload.gamePhase;
          state.teamMap[payload.nflTeamID].phase = payload.gamePhase; // Update phase for the team specifically too
        }
        return g;
      });
    },
    setInjury: (state, { payload }) => { // Set injury statis for a player
      state.playerlist = state.playerlist.map((p) => {
        if (!payload[p.id]) return p;
        p.injuryStatus = payload[p.id];
        return p;
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getPlayers.fulfilled, (state, { payload }) => {
      const np = payload.map((p) => {
        p.posName = NFLPosTypes[p.NFLPositionId].name;
        return p;
      });
      state.playerlist = np;
    });
    builder.addCase(getPlayers.rejected, (state, { payload }) => {
      if (payload) { toast.error(payload); }
    });
    builder.addCase(getGames.fulfilled, (state, { payload }) => {
      state.gamelist = [...payload].sort((a, b) => a.startTime - b.startTime);
      state.teamMap = payload.reduce((acc, cur) => { // team and game phase info
        acc[cur.away.id] = cur.away;
        acc[cur.away.id].phase = cur.phase;
        acc[cur.home.id] = cur.home;
        acc[cur.home.id].phase = cur.phase;
        return acc;
      }, {});
    });
    builder.addCase(getGames.rejected, (state, { payload }) => {
      if (payload) { toast.error(payload); }
    });
  },
});

export const {
  clear, setFilter, setSort, updatePrices, setPhase, setInjury,
} = playersSlice.actions;

export const allPlayersSelector = (state: RootState) => (
  state.players.playerlist.map((p) => ({ ...p, ...state.players.priceMap[p.id] }))
);
export const allGamesSelector = (state: RootState) => (state.players.gamelist || []);
export const allTeamsSelector = (state: RootState) => (state.players.teamMap || {});
export const playerSelector = (playerID: number) => (state: RootState) => (
  state.players.playerlist.find((p) => p.id === playerID)
);
export const playersSelector = (playerIDs: number[]) => (state: RootState) => (
  state.players.playerlist.filter((p) => playerIDs.indexOf(p.id) > -1)
);
export const priceMapSelector = (playerID: number) => (state: RootState) => (state.players.priceMap[playerID] || {});

export const pricesMapSelector = (playerIDs: number[]) => (state: RootState) => (
  playerIDs.reduce((acc, cur) => {
    acc[cur] = (state.players.priceMap[cur] || {});
    return acc;
  }, {} as Record<string, any>)
);

export const filterSelector = (state: RootState) => state.players.filter;
export const sortSelector = (state: RootState) => {
  const { sortProp } = state.players;
  const { sortDesc } = state.players;
  return { sortProp, sortDesc };
};
