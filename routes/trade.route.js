const router = require('express').Router();
const trade = require('../services/trade.service');

// Show a user's trades in a contest
router.get('/trades', async (req, res) => {
    const out = await trade.getUserTrades(req);
    return out;
});

// Pre-add a player in a contest
router.post('/add', async (req, res) => {
    const out = await trade.preTradeAdd(req);
    return out;
});

// Pre-drop a player in a contest
router.post('/drop', async (req, res) => {
    const out = await trade.preTradeDrop(req);
    return out;
});

module.exports = router;