/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import { createofferfunc, cancelofferfunc, getoffersfunc } from './Offers.api';

export const getOffers = createAsyncThunk('offers/getOffers', getoffersfunc);
export const createOffer = createAsyncThunk('offers/createOffer', createofferfunc);
export const cancelOffer = createAsyncThunk('offers/cancelOffer', cancelofferfunc);

const defaultState = {
  bids: [],
  asks: [],
  remove: [],
};

export const offersSlice = createSlice({
  name: 'offers',
  initialState: defaultState,
  reducers: {
    removeOffer: (state, { payload }) => {
      state.remove.push(payload);
      state.bids = state.bids.filter((o) => o.id !== payload);
      state.asks = state.asks.filter((o) => o.id !== payload);
    },
    alertProtMatch: (state, { payload }) => {
      state.bids.forEach((o) => {
        if (o.id === payload.offerID) { o.expire = payload.expire; }
      });
      state.asks.forEach((o) => {
        if (o.id === payload.offerID) { o.expire = payload.expire; }
      });
      toast('Protected offer matched!', { icon: '🔒' });
    },
  },
  extraReducers: {
    [getOffers.fulfilled]: (state, { payload }) => {
      payload.forEach((o) => {
        if (o.isbid) { state.bids.push(o); } else { state.asks.push(o); }
      });
    },
    [getOffers.rejected]: (state, { payload }) => {
      if (payload) { toast.error(payload); }
    },
    [createOffer.fulfilled]: (state, { payload }) => {
      if (state.remove.indexOf(payload.id) === -1) {
        if (payload.isbid) {
          state.bids.push(payload);
        } else {
          state.asks.push(payload);
        }
        toast.success('Offer submitted');
      }
    },
    [createOffer.rejected]: (state, { payload }) => {
      if (payload) { toast.error(payload); }
    },
    [cancelOffer.fulfilled]: (state, { payload }) => {
      if (payload.isbid) {
        state.bids = state.bids.filter((o) => o.id !== payload.id);
      } else {
        state.asks = state.asks.filter((o) => o.id !== payload.id);
      }
      toast.success('Offer cancelled');
    },
    [cancelOffer.rejected]: (state, { payload }) => {
      if (payload) { toast.error(payload); }
    },
  },
});

export const { removeOffer, alertProtMatch } = offersSlice.actions;

export const offersSelector = (state) => state.offers;
