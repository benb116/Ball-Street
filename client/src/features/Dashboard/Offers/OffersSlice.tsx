/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import type { RootState } from '../../../app/store';
import API from '../../../helpers/api';
import { ErrHandler } from '../../../helpers/util';

import { OfferItemType } from '../../types';

interface OfferState {
  bids: OfferItemType[],
  asks: OfferItemType[],
  remove: string[],
}
const defaultState: OfferState = {
  bids: [],
  asks: [],
  remove: [],
};

export const offersSlice = createSlice({
  name: 'offers',
  initialState: defaultState,
  reducers: {
    // Clear an offer from the list
    // Don't know if it's bid or ask so check both
    removeOffer: (state, { payload } : { payload: string }) => {
      state.remove.push(payload);
      state.bids = state.bids.filter((o) => o.id !== payload);
      state.asks = state.asks.filter((o) => o.id !== payload);
    },
    // When a protected match comes in, update the offer's expiration
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
  extraReducers: (builder) => {
    builder.addMatcher(API.endpoints.getOffers.matchFulfilled, (state, { payload }) => {
      payload.forEach((o) => {
        if (o.isbid) { state.bids.push(o); } else { state.asks.push(o); }
      });
    });
    builder.addMatcher(API.endpoints.getOffers.matchRejected, ErrHandler);

    builder.addMatcher(API.endpoints.createOffer.matchFulfilled, (state, { payload }) => {
      // If an offer is filled immediately,
      // It may be marked as filled before the "create offer" has resolved.
      // So check to make sure it hasn't already been added to the "remove" list
      if (state.remove.indexOf(payload.id) === -1) {
        if (payload.isbid) {
          state.bids.push(payload);
        } else {
          state.asks.push(payload);
        }
        toast.success('Offer submitted');
      }
    });
    builder.addMatcher(API.endpoints.createOffer.matchRejected, ErrHandler);

    builder.addMatcher(API.endpoints.cancelOffer.matchFulfilled, (state, { payload }) => {
      if (payload.isbid) {
        state.bids = state.bids.filter((o) => o.id !== payload.id);
      } else {
        state.asks = state.asks.filter((o) => o.id !== payload.id);
      }
      toast.success('Offer cancelled');
    });
    builder.addMatcher(API.endpoints.cancelOffer.matchRejected, ErrHandler);
  },
});

export const { removeOffer, alertProtMatch } = offersSlice.actions;

export const offersSelector = (state: RootState) => state.offers;
