/* eslint-disable no-param-reassign */
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
export const getLeague = createAsyncThunk('leagues/getLeague', getleaguefunc);
export const getContests = createAsyncThunk('leagues/getContests', getcontestsfunc);
export const getLeagueMembers = createAsyncThunk('leagues/getLeagueMembers', getleaguemembersfunc);
export const createLeague = createAsyncThunk('leagues/createLeague', createleaguefunc);
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
    [getUserLeagues.rejected]: (state, { payload }) => {
      if (payload) { toast.error(payload); }
    },
    [getPublicLeagues.fulfilled]: (state, { payload }) => {
      state.publicleagues = payload;
    },
    [getPublicLeagues.rejected]: (state, { payload }) => {
      if (payload) { toast.error(payload); }
    },
    [createLeague.fulfilled]: (state, { payload }) => {
      state.userleagues.push(payload);
    },
    [createLeague.rejected]: (state, { payload }) => {
      if (payload) { toast.error(payload); }
    },
    [getLeague.fulfilled]: (state, { payload }) => {
      state.thisleague = payload;
    },
    [getLeague.rejected]: (state, { payload }) => {
      if (payload) { toast.error(payload); }
    },
    [getContests.fulfilled]: (state, { payload }) => {
      state.thisleaguecontests = payload;
    },
    [getContests.rejected]: (state, { payload }) => {
      if (payload) { toast.error(payload); }
    },
    [getLeagueMembers.fulfilled]: (state, { payload }) => {
      state.thisleaguemembers = payload;
    },
    [getLeagueMembers.rejected]: (state, { payload }) => {
      if (payload) { toast.error(payload); }
    },
    [addMember.fulfilled]: (state, { payload }) => {
      state.thisleaguemembers.push(payload.name);
    },
    [addMember.rejected]: (state, { payload }) => {
      if (payload) { toast.error(payload); }
    },
    [createContest.fulfilled]: (state, { payload }) => {
      state.thisleaguecontests.push(payload);
    },
    [createContest.rejected]: (state, { payload }) => {
      toast.error(payload);
    },
  },
});

export const leaguesSelector = (state) => ({
  userLeagues: state.leagues.userleagues,
  publicLeagues: state.leagues.publicleagues,
});

export const leagueSelector = (state) => state.leagues.thisleague;
export const leagueContestsSelector = (state) => state.leagues.thisleaguecontests;
export const leagueMembersSelector = (state) => state.leagues.thisleaguemembers;
