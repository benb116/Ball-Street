import { configureStore } from '@reduxjs/toolkit';
import { userSlice } from '../features/User/UserSlice';
import { leaguesSlice } from '../features/Leagues/LeaguesSlice';
export default configureStore({
  reducer: {
    user: userSlice.reducer,
    leagues: leaguesSlice.reducer,
  },
});
