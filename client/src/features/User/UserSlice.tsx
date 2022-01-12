/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import type { RootState } from '../../app/store';
import API from '../../helpers/api';
import { ErrHandler } from '../../helpers/util';

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
    builder.addMatcher(API.endpoints.signup.matchFulfilled, (state, { payload }) => {
      if (payload.needsVerification) {
        toast.success('Account created. Please check your email to verify your account.');
      } else {
        state.info = { ...state.info, ...payload };
        localStorage.setItem('isLoggedIn', 'true');
      }
    });
    builder.addMatcher(API.endpoints.signup.matchRejected, ErrHandler);

    builder.addMatcher(API.endpoints.forgot.matchFulfilled, () => {
      toast.success('An email was sent to this address');
    });
    builder.addMatcher(API.endpoints.forgot.matchRejected, ErrHandler);

    builder.addMatcher(API.endpoints.reset.matchFulfilled, () => {
      toast.success('Password reset successfully');
    });
    builder.addMatcher(API.endpoints.reset.matchRejected, ErrHandler);

    builder.addMatcher(API.endpoints.login.matchFulfilled, (state, { payload }) => {
      if (payload.needsVerification) {
        toast.success('Please check your email to verify your account.');
      } else {
        state.info = { ...state.info, ...payload };
        localStorage.setItem('isLoggedIn', 'true');
      }
    });
    builder.addMatcher(API.endpoints.login.matchRejected, ErrHandler);

    builder.addMatcher(API.endpoints.logout.matchFulfilled, (state) => {
      state.info = defaultState.info;
      localStorage.setItem('isLoggedIn', 'false');
    });
    builder.addMatcher(API.endpoints.logout.matchRejected, ErrHandler);

    builder.addMatcher(API.endpoints.getAccount.matchFulfilled, (state, { payload }) => {
      if (!payload) {
        localStorage.setItem('isLoggedIn', 'false');
      } else {
        state.info = { ...state.info, ...payload };
      }
    });
    builder.addMatcher(API.endpoints.getAccount.matchRejected, () => {
      localStorage.setItem('isLoggedIn', 'false');
    });
  },
});

export const { set, clearState } = userSlice.actions;
export const userSelector = (state: RootState) => state.user.info;
export const isLoggedInSelector = () => (localStorage.getItem('isLoggedIn') === 'true');
