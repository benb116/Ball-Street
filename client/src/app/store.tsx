import { configureStore } from '@reduxjs/toolkit';
import { userSlice } from '../features/User/UserSlice';

import { entrySlice } from '../features/Dashboard/Entry/EntrySlice';
import { leaderboardSlice } from '../features/Dashboard/Leaderboard/LeaderboardSlice';
import { offersSlice } from '../features/Dashboard/Offers/OffersSlice';
import { playersSlice } from '../features/Dashboard/Players/PlayersSlice';
import { contestsSlice } from '../features/Contests/ContestsSlice';
import { modalSlice } from '../features/Dashboard/Modal/ModalSlice';
import { tradesSlice } from '../features/Dashboard/Trades/TradesSlice';

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
