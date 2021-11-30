const router = require('express').Router({ mergeParams: true });

const nflplayer = require('./nflplayer.service');
const { routeHandler } = require('../util/util.route');
const getNFLGames = require('../nflgame/services/getNFLGames.service');

// Get all players
router.get('/', routeHandler(nflplayer.getNFLPlayers, 10));

// Get all games
router.get('/games', routeHandler(getNFLGames));

// Get a player's info
router.get('/:nflplayerID', routeHandler(nflplayer.getNFLPlayer, 10));

module.exports = router;
