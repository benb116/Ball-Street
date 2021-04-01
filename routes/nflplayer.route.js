const router = require('express').Router();
const nflplayer = require('../services/nflplayer.service');
const authenticate = require('../middleware/authenticate');

// Get all players 
router.get('/', async (req, res) => {
    const out = await nflplayer.getNFLPlayers(req);
});

// Get a player's info
router.get('/:nflplayerID', async (req, res) => {
    const out = await nflplayer.getNFLPlayer(req);
    return res.json(out);
});

// Get a player's orderbook in a contest
router.get('/:nflplayerID/orderbook', authenticate, async (req, res) => {
    const out = await nflplayer.getNFLPlayerOfferSummary(req);
    return res.json(out);
});

// Get a player's trade statistics in a contest
router.get('/:nflplayerID/tradestats', authenticate, async (req, res) => {
    const out = await nflplayer.getNFLPlayerTradeVolume(req);
    return res.json(out);
});

// Get a player's add statistics in a contest
router.get('/:nflplayerID/addstats', authenticate, async (req, res) => {
    const out = await nflplayer.getNFLPlayerNumAdds(req);
    return res.json(out);
});
module.exports = router;