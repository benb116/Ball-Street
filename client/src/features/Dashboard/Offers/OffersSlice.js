import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { createofferfunc, cancelofferfunc, getoffersfunc } from './Offers.api'

export const getOffers = createAsyncThunk('offers/getOffers', getoffersfunc);
export const create = createAsyncThunk('offers/create', createofferfunc);
export const cancel = createAsyncThunk('offers/cancel', cancelofferfunc);

const defaultState = {
  bids: [],
  asks: [],
};

export const offersSlice = createSlice({
  name: 'offers',
  initialState: defaultState,
  reducers: {
    
  },
  extraReducers: {
    [getOffers.fulfilled]: (state, {payload}) => {
      payload.forEach(o => {
        if (o.isbid) { state.bids.push(o); } else { state.asks.push(o); }
      });
    },
    [create.fulfilled]: (state, { payload }) => {
      if (payload.isbid) {
        state.bids.push(payload);
      } else {
        state.asks.push(payload);
      }
    },
    [cancel.fulfilled]: (state, { payload }) => {
      if (payload.isbid) {
        state.bids.filter(o => o.id !== payload.id);
      } else {
        state.asks.filter(o => o.id !== payload.id);
      }
    },
  },
});

export const { } = offersSlice.actions;

export const offersSelector = (state) => state.offers;
