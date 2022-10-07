import BaseAPI from '@client/helpers/api';
import { GameItemType, PlayerItemType } from './Players.types';

const PlayersAPI = BaseAPI.injectEndpoints({
  endpoints: (build) => ({
    getPlayers: build.query<PlayerItemType[], void>({ query: () => '/api/nfldata' }),
    getGames: build.query<GameItemType[], void>({ query: () => '/api/nfldata/games' }),

  }),
});

export const { useGetPlayersQuery, useGetGamesQuery } = PlayersAPI;

export default PlayersAPI;
