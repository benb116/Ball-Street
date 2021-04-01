const router = require('express').Router();
const contest = require('../services/contest.service');
const authenticate = require('../middleware/authenticate');

// Get all contests a user is in
router.get('/', authenticate, async (req, res) => {
    const out = await contest.getUserContests(req);
    return res.json(out);
});

// Get a specific contest
router.get('/:contestID', authenticate, async (req, res) => {
    const out = await contest.getContest(req);
    return res.json(out);
});

router.use('/', require('./entry.route'));
router.use('/', require('./offer.route'));
router.use('/', require('./trade.route'));

module.exports = router;