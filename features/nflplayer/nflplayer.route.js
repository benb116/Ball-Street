const router = require('express').Router({mergeParams: true});
const nflplayer = require('./nflplayer.service');

const { routeHandler } = require('../util/util.route');

// Get a player's orderbook in a contest
router.get('/players/:nflplayerID/orderbook', routeHandler(nflplayer.getNFLPlayerOfferSummary));

// Get a player's trade statistics in a contest
router.get('/players/:nflplayerID/tradestats', routeHandler(nflplayer.getNFLPlayerTradeVolume));

// Get a player's add statistics in a contest
router.get('/players/:nflplayerID/addstats', routeHandler(nflplayer.getNFLPlayerNumAdds));

module.exports = router;