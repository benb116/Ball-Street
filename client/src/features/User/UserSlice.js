import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import { signupfunc, loginfunc, logoutfunc, accountfunc } from './User.api.js';

const defaultState = {
  info: {
    id: null,
    email: '',
    name: '',
  },
  redirect: '',
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
      state.info = {...state.info, ...payload};
      localStorage.setItem('isLoggedIn', true);
    },
    [signupUser.pending]: (state) => {
    },
    [signupUser.rejected]: (state, { payload }) => {
      toast.error(payload);
    },

    [loginUser.fulfilled]: (state, { payload }) => {
      state.info = {...state.info, ...payload};
      localStorage.setItem('isLoggedIn', true);
    },
    [loginUser.pending]: (state) => {
    },
    [loginUser.rejected]: (state, { payload }) => {
      toast.error(payload);
    },

    [logoutUser.fulfilled]: (state, {payload}) => {
      state.info = defaultState.info;
      localStorage.setItem('isLoggedIn', false);
    },
    [logoutUser.pending]: (state) => {
    },
    [logoutUser.rejected]: (state, {payload}) => {
      toast.error(payload);
    },

    [getAccount.fulfilled]: (state, { payload }) => {
      if (!payload) {
        localStorage.setItem('isLoggedIn', false);
      } else {
        state.info = {...state.info, ...payload};
      }
    },
    [getAccount.pending]: (state) => {
    },
    [getAccount.rejected]: (state, {payload}) => {
      localStorage.setItem('isLoggedIn', false);
    },
  },
});

export const { set, clearStatus, clearState } = userSlice.actions;
export const userSelector = (state) => state.user.info;
export const isLoggedInSelector = (state) => (localStorage.getItem('isLoggedIn') === 'true');