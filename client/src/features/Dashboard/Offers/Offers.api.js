import thunkReq from '../../../helpers/thunkReqWrapper';

function getoffersfunc({ contestID }, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', `/app/api/contests/${contestID}/offers`);
}
function createofferfunc({ contestID, offerobj }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', `/app/api/contests/${contestID}/offer`, JSON.stringify({ offerobj }));
}
function cancelofferfunc({ contestID, offerID }, thunkAPI) {
  return thunkReq(thunkAPI, 'DELETE', `/app/api/contests/${contestID}/offer`, JSON.stringify({ offerID }));
}

export {
  getoffersfunc,
  createofferfunc,
  cancelofferfunc,
};
