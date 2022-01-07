import thunkReq from '../../../helpers/thunkReqWrapper';
import { GameItemType, PlayerItemType } from '../../types';

// Get all players
async function getplayersfunc(_a = {}, thunkAPI) {
  return await thunkReq(thunkAPI, 'GET', '/app/api/nfldata/') as PlayerItemType[];
}

// Get all games
async function getgamesfunc(_a = {}, thunkAPI) {
  return await thunkReq(thunkAPI, 'GET', '/app/api/nfldata/games') as GameItemType[];
}

export {
  getplayersfunc,
  getgamesfunc,
};
