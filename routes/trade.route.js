const router = require('express').Router();
const trade = require('../services/trade.service');
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate, async (req, res) => {
    const out = await trade.getUserTrades(req);
    return out;
});

module.exports = router;