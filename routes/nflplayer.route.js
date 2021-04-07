const router = require('express').Router();
const nflplayer = require('../services/nflplayer.service');

// Get a player's orderbook in a contest
router.get('/players/:nflplayerID/orderbook', async (req, res) => {
    const out = await nflplayer.getNFLPlayerOfferSummary(req);
    return res.json(out);
});

// Get a player's trade statistics in a contest
router.get('/players/:nflplayerID/tradestats', async (req, res) => {
    const out = await nflplayer.getNFLPlayerTradeVolume(req);
    return res.json(out);
});

// Get a player's add statistics in a contest
router.get('/players/:nflplayerID/addstats', async (req, res) => {
    const out = await nflplayer.getNFLPlayerNumAdds(req);
    return res.json(out);
});
module.exports = router;