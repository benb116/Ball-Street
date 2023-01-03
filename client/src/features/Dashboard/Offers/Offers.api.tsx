import BaseAPI from '../../../helpers/api';

import { OfferItemType, OfferObj } from './Offers.types';

const OffersAPI = BaseAPI.injectEndpoints({
  endpoints: (build) => ({
    getOffers: build.query<OfferItemType[], string>({ query: (contestID) => `/api/contests/${contestID}/offers` }),
    createOffer: build.mutation<OfferItemType, { contestID: string, offerobj: OfferObj }>({
      query: ({ contestID, ...body }) => ({ url: `/api/contests/${contestID}/offer`, method: 'POST', body }),
    }),
    cancelOffer: build.mutation<OfferItemType, { contestID: string, offerID: string }>({
      query: ({ contestID, ...body }) => ({ url: `/api/contests/${contestID}/offer`, method: 'DELETE', body }),
    }),
  }),
});

export const { useGetOffersQuery, useCreateOfferMutation, useCancelOfferMutation } = OffersAPI;

export default OffersAPI;
