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

module.exports = router;