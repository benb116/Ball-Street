const router = require('express').Router();
const nflplayer = require('../services/nflplayer.service');
const authenticate = require('../middleware/authenticate');

const { routeHandler } = require('./util.route');

// Get all players
router.get('/', routeHandler(nflplayer.getNFLPlayers));

// Get a player's info
router.get('/:nflplayerID', routeHandler(nflplayer.getNFLPlayer));

module.exports = router;
