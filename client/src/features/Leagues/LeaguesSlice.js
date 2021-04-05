import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { getuserleaguesfunc, getpublicleaguesfunc, creatleaguefunc } from './Leagues.api.js';

const defaultState = {
    userleagues: [],
    publicleagues: [],
};

export const getUserLeagues = createAsyncThunk('leagues/getUserLeagues', getuserleaguesfunc);
export const getPublicLeagues = createAsyncThunk('leagues/getPublicLeagues', getpublicleaguesfunc);

export const createLeague = createAsyncThunk('leagues/createLeague', creatleaguefunc);

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
  },
});

export const { } = leaguesSlice.actions;

export const leaguesSelector = (state) => {
    return {
        userLeagues: state.leagues.userleagues,
        publicLeagues: state.leagues.publicleagues
    };
};
