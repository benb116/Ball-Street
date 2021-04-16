import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { createofferfunc, cancelofferfunc, getoffersfunc } from './Offers.api'

export const getOffers = createAsyncThunk('offers/getOffers', getoffersfunc);
export const createOffer = createAsyncThunk('offers/createOffer', createofferfunc);
export const cancelOffer = createAsyncThunk('offers/cancelOffer', cancelofferfunc);

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
    [createOffer.fulfilled]: (state, { payload }) => {
      if (payload.isbid) {
        state.bids.push(payload);
      } else {
        state.asks.push(payload);
      }
    },
    [cancelOffer.fulfilled]: (state, { payload }) => {
      console.log(payload)
      if (payload.isbid) {
        state.bids = state.bids.filter(o => o.id !== payload.id);
      } else {
        state.asks = state.asks.filter(o => o.id !== payload.id);
      }
    },
  },
});

export const { } = offersSlice.actions;

export const offersSelector = (state) => state.offers;