const router = require('express').Router();
const trade = require('../services/trade.service');

const { routeHandler } = require('./util.route');

// Show a user's trades in a contest
router.get('/trades', routeHandler(trade.getUserTrades));

// Pre-add a player in a contest
router.post('/add', routeHandler(trade.preTradeAdd));

// Pre-drop a player in a contest
router.post('/drop', routeHandler(trade.preTradeDrop));

module.exports = router;