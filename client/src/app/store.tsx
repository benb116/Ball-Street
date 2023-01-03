import { configureStore } from '@reduxjs/toolkit';

import { contestsSlice } from '../features/Contests/Contests.slice';
import { entrySlice } from '../features/Dashboard/Entry/Entry.slice';
import { leaderboardSlice } from '../features/Dashboard/Leaderboard/Leaderboard.slice';
import { modalSlice } from '../features/Dashboard/Modal/Modal.slice';
import { offersSlice } from '../features/Dashboard/Offers/Offers.slice';
import { playersSlice } from '../features/Dashboard/Players/Players.slice';
import { tradesSlice } from '../features/Dashboard/Trades/Trades.slice';
import { userSlice } from '../features/User/User.slice';
import API from '../helpers/api';

export const store = configureStore({
  reducer: {
    [API.reducerPath]: API.reducer,
    user: userSlice.reducer,
    contests: contestsSlice.reducer,
    entry: entrySlice.reducer,
    leaderboard: leaderboardSlice.reducer,
    offers: offersSlice.reducer,
    trades: tradesSlice.reducer,
    players: playersSlice.reducer,
    modal: modalSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(API.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
