const router = require('express').Router();
const contest = require('../services/contest.service');

// Get a specific contest
router.get('/:contestID', async (req, res) => {
    const out = await contest.getContest(req);
    return res.json(out);
});

// Create a new contest
router.post('/contest', async (req, res) => {
    const out = await contest.createContest(req);
    return res.json(out);
});

router.use('/:contestID/', require('./entry.route'));
router.use('/:contestID/', require('./offer.route'));
router.use('/:contestID/', require('./trade.route'));
router.use('/:contestID/', require('./nflplayer.route'));

module.exports = router;