import thunkReq from '../../helpers/thunkReqWrapper';
import { ContestItemType, EntryItemType, EntryType } from '../types';

// Get all contests
async function getcontestsfunc(_a = {}, thunkAPI) {
  return await thunkReq(thunkAPI, 'GET', '/app/api/contests/') as ContestItemType[];
}
// Get a specific contest
async function getcontestfunc(input: { contestID: string }, thunkAPI) {
  return await thunkReq(thunkAPI, 'GET', `/app/api/contests/${input.contestID}/`) as ContestItemType;
}
// Get my entry in a contest
async function getmyentryfunc(input: { contestID: string }, thunkAPI) {
  return await thunkReq(thunkAPI, 'GET', `/app/api/contests/${input.contestID}/entry`) as EntryType;
}
// Get all entries in a contest
async function getentriesfunc(input: { contestID: string }, thunkAPI) {
  return await thunkReq(thunkAPI, 'GET', `/app/api/contests/${input.contestID}/entries`) as EntryItemType[];
}

// Make an entry in a contest
async function createentryfunc(input: { contestID: string }, thunkAPI) {
  return await thunkReq(thunkAPI, 'POST', `/app/api/contests/${input.contestID}/entry`) as EntryType;
}

export {
  getcontestsfunc,
  getcontestfunc,
  getentriesfunc,
  createentryfunc,
  getmyentryfunc,
};
