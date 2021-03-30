const bcrypt = require('bcrypt');
const router = require('express').Router();
const league = require('../services/contest.service');
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate, async (req, res) => {
    const out = await contest.getUserLeagues(req);
    return res.json(out);
});

router.get('/public', async (req, res) => {
    const out = await contest.getPublicLeagues();
    return res.json(out);
});

router.get('/:leagueID', async (req, res) => {
    const out = await contest.getLeague(req);
    return res.json(out);
});

router.get('/:leagueID/members', async (req, res) => {
    const out = await contest.getLeagueUsers(req);
    return res.json(out);
});

router.post('/league', authenticate, async (req, res) => {
    const out = await league.createLeague(req);
    return res.json(out);
});

router.post('/:leagueID/addMember', authenticate, async (req, res) => {
    const out = await league.addMember(req);
    return res.json(out);
});

router.post('/:leagueID/join', async (req, res) => {
    const out = await league.join(req);
    return res.json(out);
});

module.exports = router;