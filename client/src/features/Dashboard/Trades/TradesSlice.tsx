/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import type { RootState } from '../../../app/store';
import API from '../../../helpers/api';

import { TradeItemType } from '../../types';

interface TradesState {
  trades: TradeItemType[],
  tradeUpdate: boolean,
}
const defaultState: TradesState = {
  trades: [],
  tradeUpdate: false,
};

export const tradesSlice = createSlice({
  name: 'trades',
  initialState: defaultState,
  reducers: {
    updateTrades: (state) => {
      state.tradeUpdate = true; // Set a flag after an offer is filled
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(API.endpoints.getTrades.matchFulfilled, (state, { payload }) => {
      state.trades = payload.map((t) => {
        const data = ('bid' in t ? t.bid : t.ask);
        // Pull certain info
        const out: TradeItemType = {
          price: t.price,
          NFLPlayerId: data.NFLPlayerId,
          isbid: data.isbid,
          createdAt: data.createdAt,
          id: data.id,
        };
        return out;
      }).sort((a: TradeItemType, b: TradeItemType) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      state.tradeUpdate = false; // reset a flag
    });
    builder.addMatcher(API.endpoints.getTrades.matchRejected, (_state, { error }) => {
      if (error) { toast.error(error.message || 'Unknown error'); }
    });
  },
});

export const { updateTrades } = tradesSlice.actions;

export const tradesSelector = (state: RootState) => state.trades.trades;
export const tradeUpdateSelector = (state: RootState) => state.trades.tradeUpdate;
