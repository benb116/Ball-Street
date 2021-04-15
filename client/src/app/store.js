import { configureStore } from '@reduxjs/toolkit';
import { userSlice } from '../features/User/UserSlice';
import { leaguesSlice } from '../features/Leagues/LeaguesSlice';

import { entrySlice } from '../features/Dashboard/Entry/EntrySlice';
import { leaderboardSlice } from '../features/Dashboard/Leaderboard/LeaderboardSlice';
import { offersSlice } from '../features/Dashboard/Offers/OffersSlice';
import { playersSlice } from '../features/Dashboard/Players/PlayersSlice';
import { contestsSlice } from '../features/Contests/ContestsSlice';

export default configureStore({
  reducer: {
    user: userSlice.reducer,
    leagues: leaguesSlice.reducer,
    contests: contestsSlice.reducer,
    // dashboard: {
      entry: entrySlice.reducer,
      leaderboard: leaderboardSlice.reducer,
      offers: offersSlice.reducer,
      players: playersSlice.reducer,
    // }
  },
});