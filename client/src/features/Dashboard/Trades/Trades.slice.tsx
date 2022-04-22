/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../../../app/store';
import { ErrHandler } from '../../../helpers/util';
import TradesAPI from './Trades.api';

import { TradeItemType } from './Trades.types';

interface TradesState {
  trades: TradeItemType[],
}
const defaultState: TradesState = {
  trades: [],
};

export const tradesSlice = createSlice({
  name: 'trades',
  initialState: defaultState,
  reducers: { },
  extraReducers: (builder) => {
    builder.addMatcher(TradesAPI.endpoints.getTrades.matchFulfilled, (state, { payload }) => {
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
    });
    builder.addMatcher(TradesAPI.endpoints.getTrades.matchRejected, ErrHandler);
  },
});

export const tradesSelector = (state: RootState) => state.trades.trades;
