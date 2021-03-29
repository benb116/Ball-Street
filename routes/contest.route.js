const router = require('express').Router();
const contest = require('../services/contest.service');
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate, async (req, res) => {
    const out = await contest.getUserContests(req);
    return res.json(out);
});

router.get('/:contestID', async (req, res) => {
    const out = await contest.getContest(req);
    return res.json(out);
});

module.exports = router;