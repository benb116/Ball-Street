import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { signupfunc, loginfunc, logoutfunc, accountfunc } from './User.api.js';

const defaultState = {
  info: {
    id: null,
    email: '',
    name: '',
  },
  status: {
    isPending: false,
    isSuccess: false,
    isError: false,
    errorMessage: '',
  }
};

export const signupUser = createAsyncThunk('users/signupUser', signupfunc);
export const loginUser  = createAsyncThunk('users/loginUser', loginfunc);
export const logoutUser = createAsyncThunk('users/logoutUser', logoutfunc);
export const getAccount = createAsyncThunk('users/getAccount', accountfunc);

export const userSlice = createSlice({
  name: 'user',
  initialState: defaultState,
  reducers: {
    set: (state, payload) => {
      state = {...state, ...payload};
    },
    clear: state => state = defaultState,
    clearState: state => state = defaultState,
    clearStatus: state => {
      state.status = defaultState.status;
    },
  },
  extraReducers: {
    [signupUser.fulfilled]: (state, { payload }) => {
      state.status.isFetching = false;
      state.status.isSuccess = true;
      state.status.isError = false;
      state.info = {...state.info, ...payload};
    },
    [signupUser.pending]: (state) => {
      state.status.isFetching = true;
      state.status.isSuccess = false;
      state.status.isError = false;
    },
    [signupUser.rejected]: (state, { payload }) => {
      state.status.isFetching = false;
      state.status.isSuccess = false;
      state.status.isError = true;
      state.status.errorMessage = payload;
    },

    [loginUser.fulfilled]: (state, { payload }) => {
      state.status.isFetching = false;
      state.status.isSuccess = true;
      state.status.isError = false;
      state.info = {...state.info, ...payload};
    },
    [loginUser.pending]: (state) => {
      state.status.isFetching = true;
      state.status.isSuccess = false;
      state.status.isError = false;
    },
    [loginUser.rejected]: (state, { payload }) => {
      state.status.isFetching = false;
      state.status.isSuccess = false;
      state.status.isError = true;
      state.status.errorMessage = payload;
    },

    [logoutUser.fulfilled]: (state, payload) => {
      state.status.isFetching = false;
      state.status.isSuccess = true;
      state.status.isError = false;
      state.info = defaultState.info;
    },
    [logoutUser.pending]: (state) => {
      state.status.isFetching = true;
      state.status.isSuccess = false;
      state.status.isError = false;
    },
    [logoutUser.rejected]: (state, payload) => {
      state.status.isFetching = false;
      state.status.isSuccess = false;
      state.status.isError = true;
      state.status.errorMessage = payload;
    },

    [getAccount.fulfilled]: (state, { payload }) => {
      state.info = {...state.info, ...payload};
    },
    [getAccount.pending]: (state) => {
    },
    [getAccount.rejected]: (state, out) => {
      state.status.isError = true;
      state.status.errorMessage = out;
    },
  },
});

export const { set, clearStatus, clearState } = userSlice.actions;
export const userSelector = (state) => state.user.info;
export const statusSelector = (state) => state.user.status;