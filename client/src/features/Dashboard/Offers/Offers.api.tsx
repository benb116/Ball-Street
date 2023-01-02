import BaseAPI from '../../../helpers/api';
import type { OfferItemType, CreateOfferQueryType, CancelOfferQueryType } from '../../../../../types/api/offer.api';

const OffersAPI = BaseAPI.injectEndpoints({
  endpoints: (build) => ({
    getOffers: build.query<OfferItemType[], string>({ query: (contestID) => `/api/contests/${contestID}/offers` }),
    createOffer: build.mutation<OfferItemType, CreateOfferQueryType>({
      query: ({ contestID, ...body }) => ({ url: `/api/contests/${contestID}/offer`, method: 'POST', body }),
    }),
    cancelOffer: build.mutation<OfferItemType, CancelOfferQueryType>({
      query: ({ contestID, ...body }) => ({ url: `/api/contests/${contestID}/offer`, method: 'DELETE', body }),
    }),
  }),
});

export const { useGetOffersQuery, useCreateOfferMutation, useCancelOfferMutation } = OffersAPI;

export default OffersAPI;
