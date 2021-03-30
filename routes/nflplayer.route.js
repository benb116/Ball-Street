const router = require('express').Router();
const nflplayer = require('../services/nflplayer.service');
const authenticate = require('../middleware/authenticate');

router.get('/', async (req, res) => {
    const out = await nflplayer.getNFLPlayers(req);
});

router.get('/:nflplayerID', async (req, res) => {
    const out = await nflplayer.getNFLPlayer(req);
    return res.json(out);
});

router.get('/orderbook', authenticate, async (req, res) => {
    const out = await nflplayer.getNFLPlayerOfferSummary(req);
    return res.json(out);
});

router.get('/tradestats', async (req, res) => {
    const out = await nflplayer.getNFLPlayerTradeVolume(req);
    return res.json(out);
});

router.get('/addstats', async (req, res) => {
    const out = await nflplayer.getNFLPlayerNumAdds(req);
    return res.json(out);
});
module.exports = router;