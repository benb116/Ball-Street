const router = require('express').Router({ mergeParams: true });

const contest = require('./contest.service');
const { routeHandler } = require('../util/util.route');

// Get all contests
router.get('/', routeHandler(contest.getContests));

// Get a specific contest
router.get('/:contestID', routeHandler(contest.getContest));

module.exports = router;
