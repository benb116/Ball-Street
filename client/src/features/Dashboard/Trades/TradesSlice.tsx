/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../../app/store';
import gettradesfunc from './Trades.api';

export const getTrades = createAsyncThunk('trades/getTrades', gettradesfunc);

export interface TradeItemType {
  id: string,
  NFLPlayerId: number,
  price: number,
  isbid: boolean,
  createdAt: string,
}
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
    builder.addCase(getTrades.fulfilled, (state, { payload }) => {
      state.trades = payload.map((t) => {
        const data = (t.bid || t.ask);
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
    builder.addCase(getTrades.rejected, (state, { payload }) => {
      if (payload) { toast.error(payload as string); }
    });
  },
});

export const { updateTrades } = tradesSlice.actions;

export const tradesSelector = (state: RootState) => state.trades.trades;
export const tradeUpdateSelector = (state: RootState) => state.trades.tradeUpdate;
