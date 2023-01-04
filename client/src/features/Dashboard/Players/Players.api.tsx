import BaseAPI from '../../../helpers/api';

import type { GameItemType, PlayerItemType } from '../../../../../types/api/player.api';

const PlayersAPI = BaseAPI.injectEndpoints({
  endpoints: (build) => ({
    getPlayers: build.query<PlayerItemType[], void>({ query: () => '/api/nfldata' }),
    getGames: build.query<GameItemType[], void>({ query: () => '/api/nfldata/games' }),

  }),
});

export const { useGetPlayersQuery, useGetGamesQuery } = PlayersAPI;

export default PlayersAPI;
