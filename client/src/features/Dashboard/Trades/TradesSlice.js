/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import gettradesfunc from './Trades.api';

export const getTrades = createAsyncThunk('trades/getTrades', gettradesfunc);

const defaultState = {
  trades: [],
  tradeUpdate: false,
};

export const tradesSlice = createSlice({
  name: 'trades',
  initialState: defaultState,
  reducers: {
    updateTrades: (state) => {
      state.tradeUpdate = true;
    },
  },
  extraReducers: {
    [getTrades.fulfilled]: (state, { payload }) => {
      state.trades = payload.map((t) => {
        const data = (t.bid || t.ask);
        const out = {};
        out.price = t.price;
        out.NFLPlayerId = data.NFLPlayerId;
        out.isbid = data.isbid;
        out.createdAt = data.createdAt;
        out.id = data.id;
        return out;
      }).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      state.tradeUpdate = false;
    },
    [getTrades.rejected]: (state, { payload }) => {
      if (payload) { toast.error(payload); }
    },
  },
});

export const { updateTrades } = tradesSlice.actions;

export const tradesSelector = (state) => state.trades.trades;
export const tradeUpdateSelector = (state) => state.trades.tradeUpdate;
