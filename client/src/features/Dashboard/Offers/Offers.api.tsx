import thunkReq from '../../../helpers/thunkReqWrapper';

// Get my offers in a contest
function getoffersfunc(input: { contestID: string }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/contests/${input.contestID}/offers`);
}
interface OfferObj {
  nflplayerID: number,
  isbid: boolean,
  price: number,
  protected: boolean,
}
// Create an offer
function createofferfunc(input: { contestID: string, offerobj: OfferObj }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', `/app/api/contests/${input.contestID}/offer`, { offerobj: input.offerobj });
}
// Cancel an offer
function cancelofferfunc(input: { contestID: string, offerID: string }, thunkAPI) {
  return thunkReq(thunkAPI, 'DELETE', `/app/api/contests/${input.contestID}/offer`, { offerID: input.offerID });
}

export {
  getoffersfunc,
  createofferfunc,
  cancelofferfunc,
};
