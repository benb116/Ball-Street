import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import {
  getuserleaguesfunc,
  getpublicleaguesfunc,
  createleaguefunc,
  getleaguefunc,
  getleaguemembersfunc,
  getcontestsfunc,
  addmemberfunc,
  createcontestfunc,
} from './Leagues.api';

const defaultState = {
    userleagues: [],
    publicleagues: [],
    thisleague: {},
    thisleaguecontests: [],
    thisleaguemembers: [],
};

export const getUserLeagues = createAsyncThunk('leagues/getUserLeagues', getuserleaguesfunc);
export const getPublicLeagues = createAsyncThunk('leagues/getPublicLeagues', getpublicleaguesfunc);

export const createLeague = createAsyncThunk('leagues/createLeague', createleaguefunc);


export const getLeague = createAsyncThunk('leagues/getLeague', getleaguefunc);
export const getContests = createAsyncThunk('leagues/getContests', getcontestsfunc);
export const getLeagueMembers = createAsyncThunk('leagues/getLeagueMembers', getleaguemembersfunc);

export const addMember = createAsyncThunk('leagues/addMember', addmemberfunc);

export const createContest = createAsyncThunk('leagues/createContest', createcontestfunc);

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
    [getContests.fulfilled]: (state, { payload }) => {
      state.thisleaguecontests = payload;
    },
    [getLeagueMembers.fulfilled]: (state, { payload }) => {
      state.thisleaguemembers = payload;
    },
    [addMember.fulfilled]: (state, { payload }) => {
      state.thisleaguemembers.push(payload);
    },
    [createContest.fulfilled]: (state, { payload }) => {
      state.thisleaguecontests.push(payload);
    },
    [createContest.rejected]: (state, { payload }) => {
      console.log(payload);
      toast.error(payload);
    },
  },
});

export const leaguesSelector = (state) => {
    return {
        userLeagues: state.leagues.userleagues,
        publicLeagues: state.leagues.publicleagues
    };
};

export const leagueSelector = (state) => state.leagues.thisleague;
export const leagueContestsSelector = (state) => state.leagues.thisleaguecontests;
export const leagueMembersSelector = (state) => state.leagues.thisleaguemembers;