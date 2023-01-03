/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { ErrHandler } from '../../../helpers/util';

import TradesAPI from './Trades.api';
import { TradeItemType } from './Trades.types';

import type { RootState } from '../../../app/store';

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
      const out: TradeItemType[] = [];
      payload.bids.forEach((b) => (out.push({
        id: b.bid.id,
        action: 'Trade for',
        NFLPlayerId: b.bid.NFLPlayerId,
        price: b.price,
        createdAt: b.bid.createdAt,
      })));
      payload.asks.forEach((a) => (out.push({
        id: a.ask.id,
        action: 'Trade away',
        NFLPlayerId: a.ask.NFLPlayerId,
        price: a.price,
        createdAt: a.ask.createdAt,
      })));
      payload.actions.forEach((a) => (out.push({
        id: a.id,
        action: a.EntryActionKind.name,
        NFLPlayerId: a.NFLPlayerId,
        price: a.price,
        createdAt: a.createdAt,
      })));
      state.trades = out.sort((a: TradeItemType, b: TradeItemType) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    });
    builder.addMatcher(TradesAPI.endpoints.getTrades.matchRejected, ErrHandler);
  },
});

export const tradesSelector = (state: RootState) => state.trades.trades;
