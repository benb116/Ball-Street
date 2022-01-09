/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../../app/store';
import {
  GameItemType, PlayerItemType, PriceMapItemType, TeamMapItemType,
} from '../../types';
import { getgamesfunc, getplayersfunc } from './Players.api';

export const getPlayers = createAsyncThunk('players/getPlayers', getplayersfunc);
export const getGames = createAsyncThunk('players/getGames', getgamesfunc);

export const NFLPosTypes = {
  1: { name: 'QB', canflex: false },
  2: { name: 'RB', canflex: true },
  3: { name: 'WR', canflex: true },
  4: { name: 'TE', canflex: true },
  5: { name: 'K', canflex: false },
  6: { name: 'DEF', canflex: false },
  99: { name: 'FLEX', canflex: true },
};

interface PlayerState {
  playerlist: PlayerItemType[],
  gamelist: GameItemType[],
  teamMap: TeamMapItemType,
  priceMap: Record<string, PriceMapItemType>,
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
    setFilter: (state, { payload }: {
      payload: {
        name: 'name' | 'posName' | 'teamAbr' | 'game' | 'phase',
        value: string,
      }
    }) => { state.filter[payload.name] = payload.value; },
    setSort: (state, { payload }: { payload: string }) => {
      if (state.sortProp === payload) { // If double click, change order
        state.sortDesc = !state.sortDesc;
      } else { // Set descending first
        state.sortDesc = true;
      }
      state.sortProp = payload; // Change sort property
    },
    updatePrices: (state, { payload }: { payload: PriceMapItemType[] }) => { // Update price info for a set of players
      const ns = state;
      payload.forEach((p) => {
        const pm = ns.priceMap[p.nflplayerID] || {};
        ns.priceMap[p.nflplayerID] = { ...(pm), ...p }; // Overwrite old values
      });
      state = ns;
    },
    setPhase: (state, { payload }: { payload: { nflTeamID: number, gamePhase: string, } }) => { // Set the phase of a team to a new phase
      state.gamelist = state.gamelist.map((g) => {
        if (g.HomeId === payload.nflTeamID || g.AwayId === payload.nflTeamID) {
          g.phase = payload.gamePhase;
          state.teamMap[payload.nflTeamID].phase = payload.gamePhase; // Update phase for the team specifically too
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
    builder.addCase(getPlayers.fulfilled, (state, { payload }) => {
      const np = payload.map((p) => {
        p.posName = NFLPosTypes[p.NFLPositionId].name;
        return p;
      });
      state.playerlist = np;
    });
    builder.addCase(getPlayers.rejected, (_state, { payload }) => {
      if (payload) { toast.error(payload as string); }
    });

    builder.addCase(getGames.fulfilled, (state, { payload }) => {
      state.gamelist = [...payload].sort((a, b) => a.startTime - b.startTime);
      state.teamMap = payload.reduce((acc, cur) => { // team and game phase info
        acc[cur.away.id] = cur.away;
        acc[cur.away.id].phase = cur.phase;
        acc[cur.home.id] = cur.home;
        acc[cur.home.id].phase = cur.phase;
        return acc;
      }, {} as TeamMapItemType);
    });
    builder.addCase(getGames.rejected, (_state, { payload }) => {
      if (payload) { toast.error(payload as string); }
    });
  },
});

export const {
  clear, setFilter, setSort, updatePrices, setPhase, setInjury,
} = playersSlice.actions;

export const allPlayersSelector = (state: RootState) => (
  state.players.playerlist.map((p) => ({ ...p, ...state.players.priceMap[p.id] })) as PlayerItemType[]
);
export const allGamesSelector = (state: RootState) => (state.players.gamelist || [] as GameItemType[]);
export const allTeamsSelector = (state: RootState) => (state.players.teamMap || {} as Record<string, PriceMapItemType>);
export const playerSelector = (playerID: number | null) => (state: RootState) => (
  !playerID ? null : state.players.playerlist.find((p) => p.id === playerID) as PlayerItemType
);
export const playersSelector = (playerIDs: number[]) => (state: RootState) => (
  state.players.playerlist.filter((p) => playerIDs.indexOf(p.id) > -1)
);
export const priceMapSelector = (playerID: number | null) => (state: RootState) => (
  !playerID ? null : state.players.priceMap[playerID] || {}
);

export const pricesMapSelector = (playerIDs: number[]) => (state: RootState) => (
  playerIDs.reduce((acc, cur) => {
    acc[cur] = (state.players.priceMap[cur] || {});
    return acc;
  }, {} as Record<string, PriceMapItemType>)
);

export const filterSelector = (state: RootState) => state.players.filter;
export const sortSelector = (state: RootState) => {
  const { sortProp, sortDesc } = state.players;
  return { sortProp, sortDesc };
};
