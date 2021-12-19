import thunkReq from '../../../helpers/thunkReqWrapper';

// Get my offers in a contest
function getoffersfunc({ contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/contests/${contestID}/offers`);
}
// Create an offer
function createofferfunc({ contestID, offerobj }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', `/app/api/contests/${contestID}/offer`, JSON.stringify({ offerobj }));
}
// Cancel an offer
function cancelofferfunc({ contestID, offerID }, thunkAPI) {
  return thunkReq(thunkAPI, 'DELETE', `/app/api/contests/${contestID}/offer`, JSON.stringify({ offerID }));
}

export {
  getoffersfunc,
  createofferfunc,
  cancelofferfunc,
};
