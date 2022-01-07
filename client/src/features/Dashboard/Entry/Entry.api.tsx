import thunkReq from '../../../helpers/thunkReqWrapper';
import { EntryType } from '../../types';

// Get my entry in a contest
async function getentryfunc(input: { contestID: string }, thunkAPI) {
  return await thunkReq(thunkAPI, 'GET', `/app/api/contests/${input.contestID}/entry`) as EntryType;
}
// Add a player in pregame
async function preaddfunc(input: { contestID: string, nflplayerID: number }, thunkAPI) {
  return await thunkReq(thunkAPI, 'POST', `/app/api/contests/${input.contestID}/add`,
    { nflplayerID: input.nflplayerID }) as EntryType;
}
// Drop a player in pregame
async function predropfunc(input: { contestID: string, nflplayerID: number }, thunkAPI) {
  return await thunkReq(thunkAPI, 'POST', `/app/api/contests/${input.contestID}/drop`,
    { nflplayerID: input.nflplayerID }) as EntryType;
}
// Move players around the roster (swap players in certain positions)
async function reorderrosterfunc(input: { contestID: string, pos1: string, pos2: string }, thunkAPI) {
  return await thunkReq(thunkAPI, 'PUT', `/app/api/contests/${input.contestID}/entry`,
    { pos1: input.pos1, pos2: input.pos2 }) as EntryType;
}

export {
  getentryfunc,
  preaddfunc,
  predropfunc,
  reorderrosterfunc,
};
