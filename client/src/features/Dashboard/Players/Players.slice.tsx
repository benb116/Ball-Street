/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../../../app/store';
import API from '../../../helpers/api';
import { ErrHandler } from '../../../helpers/util';

import {
  GameItemType,
  PhaseType,
  PlayerItemType,
  PriceMapItemType,
  SortByType,
  TeamMapType,
} from './Players.types';

export const NFLPosTypes = {
  1: { name: 'QB', canflex: false },
  2: { name: 'RB', canflex: true },
  3: { name: 'WR', canflex: true },
  4: { name: 'TE', canflex: true },
  5: { name: 'K', canflex: false },
  6: { name: 'DEF', canflex: false },
  99: { name: 'FLEX', canflex: true },
};

interface FilterType {
  name: string,
  posName: string,
  teamAbr: string,
  game: string,
  phase: string,
}
export type FilterNameType = keyof FilterType;

interface PlayerState {
  playerlist: PlayerItemType[],
  gamelist: GameItemType[],
  teamMap: TeamMapType,
  priceMap: Record<string, PriceMapItemType>,
  filter: FilterType,
  sortProp: SortByType,
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
    setFilter: (state, { payload }: { payload: { name: FilterNameType, value: string, } }) => {
      state.filter[payload.name] = payload.value;
    },
    setSort: (state, { payload }: { payload: SortByType }) => {
      if (state.sortProp === payload) { // If double click, change order
        state.sortDesc = !state.sortDesc;
      } else { // Set descending first
        state.sortDesc = true;
      }
      state.sortProp = payload; // Change sort property
    },
    updatePrices: (state, { payload }: { payload: PriceMapItemType[] }) => { // Update price info for a set of players
      payload.forEach((p) => {
        const pm = state.priceMap[p.nflplayerID] || {};
        state.priceMap[p.nflplayerID] = { ...(pm), ...p }; // Overwrite old values
      });
      // state = ns;
    },
    setPhase: (state, { payload }: { payload: { nflTeamID: number, gamePhase: string, } }) => { // Set the phase of a team to a new phase
      state.gamelist = state.gamelist.map((g) => {
        if (g.HomeId === payload.nflTeamID || g.AwayId === payload.nflTeamID) {
          g.phase = payload.gamePhase as PhaseType;
          state.teamMap[payload.nflTeamID].phase = payload.gamePhase as PhaseType; // Update phase for the team specifically too
        }
        return g;
      });
    },
    setInjury: (state, { payload }: { payload: Record<number, string | null> }) => { // Set injury statis for a player
      state.playerlist = state.playerlist.map((p) => {
        if (!payload[p.id]) return p;
        p.injuryStatus = payload[p.id];
        return p;
      });
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(API.endpoints.getPlayers.matchFulfilled, (state, { payload }) => {
      state.playerlist = payload.map((p) => {
        const np = { ...p };
        np.posName = NFLPosTypes[p.NFLPositionId].name;
        return np;
      });
    });
    builder.addMatcher(API.endpoints.getPlayers.matchRejected, ErrHandler);

    builder.addMatcher(API.endpoints.getGames.matchFulfilled, (state, { payload }) => {
      state.gamelist = [...payload].sort((a, b) => a.startTime - b.startTime);
      state.teamMap = payload.reduce((acc, cur) => { // team and game phase info
        acc[cur.away.id] = { ...cur.away, phase: cur.phase };
        acc[cur.home.id] = { ...cur.home, phase: cur.phase };
        return acc;
      }, {} as TeamMapType);
    });
    builder.addMatcher(API.endpoints.getGames.matchRejected, ErrHandler);
  },
});

export const {
  clear, setFilter, setSort, updatePrices, setPhase, setInjury,
} = playersSlice.actions;

export const allPlayersSelector = (state: RootState) => (
  state.players.playerlist.map((p) => ({ ...p, ...state.players.priceMap[p.id] })) as PlayerItemType[]
);
export const allGamesSelector = (state: RootState) => (state.players.gamelist || [] as GameItemType[]);
export const allTeamsSelector = (state: RootState) => (state.players.teamMap || {} as TeamMapType);
export const pricesMapSelector = (state: RootState) => (state.players.priceMap || {} as Record<string, PriceMapItemType>);
export const playerSelector = (playerID: number | null) => (state: RootState) => (
  !playerID ? null : state.players.playerlist.find((p) => p.id === playerID) as PlayerItemType
);
export const playersSelector = (playerIDs: number[]) => (state: RootState) => (
  state.players.playerlist.filter((p) => playerIDs.indexOf(p.id) > -1)
);
export const priceMapSelector = (playerID: number | null) => (state: RootState) => (
  !playerID ? null : state.players.priceMap[playerID] || {}
);

export const filterSelector = (state: RootState) => state.players.filter;
export const sortSelector = (state: RootState) => {
  const { sortProp, sortDesc } = state.players;
  return { sortProp, sortDesc };
};
