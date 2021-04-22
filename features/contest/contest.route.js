const router = require('express').Router({ mergeParams: true });

const contest = require('./contest.service');
const { routeHandler } = require('../util/util.route');

// Get all contests in a league
router.get('/', routeHandler(contest.getLeagueContests, 30));

// Get a specific contest
router.get('/:contestID', routeHandler(contest.getContest, 15));

// Create a new contest
router.post('/contest', routeHandler(contest.createContest));

module.exports = router;
