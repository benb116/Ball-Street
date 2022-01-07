/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import type { RootState } from '../../app/store';

import {
  signupfunc, loginfunc, logoutfunc, accountfunc, forgotfunc, resetfunc,
} from './User.api';

interface UserState {
  info: {
    id: number | null,
    email: string,
    name: string,
  },
  redirect: string,
}
const defaultState: UserState = {
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      state = defaultState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signupUser.fulfilled, (state, { payload }) => {
      if (payload.needsVerification) {
        toast.success('Account created. Please check your email to verify your account.');
      } else {
        state.info = { ...state.info, ...payload };
        localStorage.setItem('isLoggedIn', 'true');
      }
    });
    builder.addCase(signupUser.rejected, (state, { payload }) => {
      toast.error(payload as string);
    });

    builder.addCase(forgotUser.fulfilled, () => {
      toast.success('An email was sent to this address');
    });
    builder.addCase(forgotUser.rejected, (state, { payload }) => {
      toast.error(payload as string);
    });

    builder.addCase(resetUser.fulfilled, () => {
      toast.success('Password reset successfully');
    });
    builder.addCase(resetUser.rejected, (state, { payload }) => {
      toast.error(payload as string);
    });

    builder.addCase(loginUser.fulfilled, (state, { payload }) => {
      if (payload.needsVerification) {
        toast.success('Please check your email to verify your account.');
      } else {
        state.info = { ...state.info, ...payload };
        localStorage.setItem('isLoggedIn', 'true');
      }
    });
    builder.addCase(loginUser.rejected, (state, { payload }) => {
      toast.error(payload as string);
    });

    builder.addCase(logoutUser.fulfilled, (state) => {
      state.info = defaultState.info;
      localStorage.setItem('isLoggedIn', 'false');
    });
    builder.addCase(logoutUser.rejected, (state, { payload }) => {
      toast.error(payload as string);
    });

    builder.addCase(getAccount.fulfilled, (state, { payload }) => {
      if (!payload) {
        localStorage.setItem('isLoggedIn', 'false');
      } else {
        state.info = { ...state.info, ...payload };
      }
    });
    builder.addCase(getAccount.rejected, () => {
      localStorage.setItem('isLoggedIn', 'false');
    });
  },
});

export const { set, clearState } = userSlice.actions;
export const userSelector = (state: RootState) => state.user.info;
export const isLoggedInSelector = () => (localStorage.getItem('isLoggedIn') === 'true');
