import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import {
  getuserleaguesfunc,
  getpublicleaguesfunc,
  createleaguefunc,
  getleaguefunc,
  addmemberfunc,
} from './Leagues.api.js';

const defaultState = {
    userleagues: [],
    publicleagues: [],
    thisleague: {},
    thisleaguecontests: [],
};

export const getUserLeagues = createAsyncThunk('leagues/getUserLeagues', getuserleaguesfunc);
export const getPublicLeagues = createAsyncThunk('leagues/getPublicLeagues', getpublicleaguesfunc);

export const createLeague = createAsyncThunk('leagues/createLeague', createleaguefunc);

export const getLeague = createAsyncThunk('leagues/getLeague', getleaguefunc);

export const addMember = createAsyncThunk('leagues/addMember', addmemberfunc);

export const leaguesSlice = createSlice({
  name: 'leagues',
  initialState: defaultState,
  reducers: {
    
  },
  extraReducers: {
    [getUserLeagues.fulfilled]: (state, { payload }) => {
      state.userleagues = payload;
    },
    [getPublicLeagues.fulfilled]: (state, { payload }) => {
      state.publicleagues = payload;
    },
    [createLeague.fulfilled]: (state, { payload }) => {
      state.userleagues.push(payload);
    },
    [getLeague.fulfilled]: (state, { payload }) => {
      state.thisleague = payload;
    },
  },
});

export const {} = leaguesSlice.actions;

export const leaguesSelector = (state) => {
    return {
        userLeagues: state.leagues.userleagues,
        publicLeagues: state.leagues.publicleagues
    };
};

export const leagueSelector = (state) => {
  return state.leagues.thisleague;
};