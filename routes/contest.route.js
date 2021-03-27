const router = require('express').Router();
const contest = require('../services/contest.service');

router.get('/', contest.getUserContests);
router.get('/contest', contest.getContest);

module.exports = router;