import express from 'express';

import routeHandler from '@util/util.route';

import getNFLGames from '../nflgame/services/getNFLGames.service';
import getNFLPlayer from './services/getNFLPlayer.service';
import getNFLPlayers from './services/getNFLPlayers.service';

const router = express.Router({ mergeParams: true });

// Get all players
router.get('/', routeHandler(getNFLPlayers, 10));

// Get all games
router.get('/games', routeHandler(getNFLGames, 10));

// Get a player's info
router.get('/:nflplayerID', routeHandler(getNFLPlayer, 10));

export default router;
