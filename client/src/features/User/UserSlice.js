/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import {
  signupfunc, loginfunc, logoutfunc, accountfunc, forgotfunc, resetfunc,
} from './User.api';

const defaultState = {
  info: {
    id: null,
    email: '',
    name: '',
  },
  redirect: '',
};

export const signupUser = createAsyncThunk('users/signupUser', signupfunc);
export const forgotUser = createAsyncThunk('users/forgotUser', forgotfunc);
export const resetUser = createAsyncThunk('users/resetUser', resetfunc);
export const loginUser = createAsyncThunk('users/loginUser', loginfunc);
export const logoutUser = createAsyncThunk('users/logoutUser', logoutfunc);
export const getAccount = createAsyncThunk('users/getAccount', accountfunc);

export const userSlice = createSlice({
  name: 'user',
  initialState: defaultState,
  reducers: {
    set: (state, payload) => {
      state = { ...state, ...payload };
    },
    clearState: (state) => {
      // eslint-disable-next-line no-unused-vars
      state = defaultState;
    },
    clearStatus: (state) => {
      state.status = defaultState.status;
    },
  },
  extraReducers: {
    [signupUser.fulfilled]: (state, { payload }) => {
      if (payload.needsVerification) {
        toast.success('Account created. Please check your email to verify your account.');
      } else {
        state.info = { ...state.info, ...payload };
        localStorage.setItem('isLoggedIn', true);
      }
    },
    [signupUser.rejected]: (state, { payload }) => {
      toast.error(payload);
    },

    [forgotUser.fulfilled]: () => {
      toast.success('An email was sent to this address');
    },
    [forgotUser.rejected]: (state, { payload }) => {
      toast.error(payload);
    },

    [resetUser.fulfilled]: () => {
      toast.success('Password reset successfully');
    },
    [resetUser.rejected]: (state, { payload }) => {
      toast.error(payload);
    },

    [loginUser.fulfilled]: (state, { payload }) => {
      if (payload.needsVerification) {
        toast.success('Please check your email to verify your account.');
      } else {
        state.info = { ...state.info, ...payload };
        localStorage.setItem('isLoggedIn', true);
      }
    },
    [loginUser.rejected]: (state, { payload }) => {
      toast.error(payload);
    },

    [logoutUser.fulfilled]: (state) => {
      state.info = defaultState.info;
      localStorage.setItem('isLoggedIn', false);
    },
    [logoutUser.rejected]: (state, { payload }) => {
      toast.error(payload);
    },

    [getAccount.fulfilled]: (state, { payload }) => {
      if (!payload) {
        localStorage.setItem('isLoggedIn', false);
      } else {
        state.info = { ...state.info, ...payload };
      }
    },
    [getAccount.rejected]: () => {
      localStorage.setItem('isLoggedIn', false);
    },
  },
});

export const { set, clearStatus, clearState } = userSlice.actions;
export const userSelector = (state) => state.user.info;
export const isLoggedInSelector = () => (localStorage.getItem('isLoggedIn') === 'true');
