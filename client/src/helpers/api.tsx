// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a service using a base URL and expected endpoints
const BaseAPI = createApi({
  reducerPath: 'API',
  baseQuery: fetchBaseQuery({ baseUrl: '/app' }),
  tagTypes: ['Account', 'Roster', 'Trades', 'Ledger'],
  endpoints: () => ({ }),
});

export default BaseAPI;
