const bcrypt = require('bcrypt');
const router = require('express').Router();
const league = require('../services/contest.service');
const authenticate = require('../middleware/authenticate');

// Get all leagues a user has joined
router.get('/', authenticate, async (req, res) => {
    const out = await contest.getUserLeagues(req);
    return res.json(out);
});

// Get all public leagues
router.get('/public', async (req, res) => {
    const out = await contest.getPublicLeagues();
    return res.json(out);
});

// Get a specific league
router.get('/:leagueID', async (req, res) => {
    const out = await contest.getLeague(req);
    return res.json(out);
});

// Get a specific league's members
router.get('/:leagueID/members', authenticate, async (req, res) => {
    const out = await contest.getLeagueUsers(req);
    return res.json(out);
});

// Make a new league
router.post('/league', authenticate, async (req, res) => {
    const out = await league.createLeague(req);
    return res.json(out);
});

// Add a user to a private league
router.post('/:leagueID/addMember', authenticate, async (req, res) => {
    const out = await league.addMember(req);
    return res.json(out);
});

// Join a public league
router.post('/:leagueID/join', async (req, res) => {
    const out = await league.join(req);
    return res.json(out);
});

module.exports = router;