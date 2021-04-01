const router = require('express').Router();
const trade = require('../services/trade.service');
const authenticate = require('../middleware/authenticate');

// Show a user's trades in a contest
router.get('/:contestID/', authenticate, async (req, res) => {
    const out = await trade.getUserTrades(req);
    return out;
});

// Pre-add a player in a contest
router.post('/:contestID/add', authenticate, async (req, res) => {
    const out = await trade.preTradeAdd(req);
    return out;
});

// Pre-drop a player in a contest
router.post('/:contestID/drop', authenticate, async (req, res) => {
    const out = await trade.preTradeDrop(req);
    return out;
});

module.exports = router;