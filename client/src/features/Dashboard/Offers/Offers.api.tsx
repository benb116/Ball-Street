import thunkReq from '../../../helpers/thunkReqWrapper';
import { OfferItemType, OfferObj } from '../../types';

// Get my offers in a contest
async function getoffersfunc(input: { contestID: string }, thunkAPI) {
  return await thunkReq(thunkAPI, 'GET', `/app/api/contests/${input.contestID}/offers`) as OfferItemType[];
}
// Create an offer
async function createofferfunc(input: { contestID: string, offerobj: OfferObj }, thunkAPI) {
  return await thunkReq(thunkAPI, 'POST', `/app/api/contests/${input.contestID}/offer`,
    { offerobj: input.offerobj }) as OfferItemType;
}
// Cancel an offer
async function cancelofferfunc(input: { contestID: string, offerID: string }, thunkAPI) {
  return await thunkReq(thunkAPI, 'DELETE', `/app/api/contests/${input.contestID}/offer`,
    { offerID: input.offerID }) as OfferItemType;
}

export {
  getoffersfunc,
  createofferfunc,
  cancelofferfunc,
};
