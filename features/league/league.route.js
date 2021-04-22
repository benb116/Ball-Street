const router = require('express').Router({ mergeParams: true });

const league = require('./league.service');
const { routeHandler } = require('../util/util.route');

// Get all leagues a user has joined
router.get('/', routeHandler(league.getUserLeagues));

// Get all public leagues
router.get('/public', routeHandler(league.getPublicLeagues, 15));

// Get a specific league
router.get('/:leagueID', routeHandler(league.getLeague, 15));

// Get a specific league's members
router.get('/:leagueID/members', routeHandler(league.getLeagueUsers, 15));

// Make a new league
router.post('/league', routeHandler(league.createLeague));

// Add a user to a private league
router.post('/:leagueID/addMember', routeHandler(league.addMember));

// Join a public league
router.post('/:leagueID/join', routeHandler(league.join));

module.exports = router;
