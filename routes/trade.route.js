const router = require('express').Router();
const trade = require('../services/trade.service');

router.get('/', trade.getUserTrades);

module.exports = router;