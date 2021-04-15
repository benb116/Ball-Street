const router = require('express').Router();
const contest = require('../services/contest.service');

const { routeHandler } = require('./util.route');

// Get all contests in a league
router.get('/contests', routeHandler(contest.getLeagueContests));

// Get a specific contest
router.get('/:contestID', routeHandler(contest.getContest));

// Create a new contest
router.post('/contest', routeHandler(contest.createContest));

router.use('/:contestID/', require('./entry.route'));
router.use('/:contestID/', require('./offer.route'));
router.use('/:contestID/', require('./trade.route'));
router.use('/:contestID/', require('./nflplayer.route'));

module.exports = router;
