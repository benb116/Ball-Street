const router = require('express').Router({ mergeParams: true });

const nflplayer = require('./nflplayer.service');
const { routeHandler } = require('../util/util.route');

// Get all players
router.get('/', routeHandler(nflplayer.getNFLPlayers, 10));

// Get a player's info
router.get('/:nflplayerID', routeHandler(nflplayer.getNFLPlayer, 10));

module.exports = router;
