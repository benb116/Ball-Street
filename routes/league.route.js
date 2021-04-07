const bcrypt = require('bcrypt');
const router = require('express').Router();
const league = require('../services/league.service');

router.use('/:leagueID/', require('./contest.route'));

// Get all leagues a user has joined
router.get('/', async (req, res) => {
    const out = await league.getUserLeagues(req);
    return res.json(out);
});

// Get all public leagues
router.get('/public', async (req, res) => {
    const out = await league.getPublicLeagues();
    return res.json(out);
});

// Get a specific league
router.get('/:leagueID', async (req, res) => {
    const out = await league.getLeague(req);
    return res.json(out);
});

// Get a specific league's members
router.get('/:leagueID/members', async (req, res) => {
    const out = await league.getLeagueUsers(req);
    return res.json(out);
});

// Make a new league
router.post('/league', async (req, res) => {
    const out = await league.createLeague(req);
    return res.json(out);
});

// Add a user to a private league
router.post('/:leagueID/addMember', async (req, res) => {
    const out = await league.addMember(req);
    return res.json(out);
});

// Join a public league
router.post('/:leagueID/join', async (req, res) => {
    const out = await league.join(req);
    return res.json(out);
});

module.exports = router;