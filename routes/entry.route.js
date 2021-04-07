const router = require('express').Router();
const entry = require('../services/entry.service');

// Get all entries in a contest
router.get('/entries', async (req, res) => {
    const out = await entry.getContestEntries(req);
    return res.json(out);
});

// Get a user's entry in a contest
router.get('/entry', async (req, res) => {
    const out = await entry.getEntry(req);
    return res.json(out);
});

// Create a user's entry in a contest
router.post('/entry', async (req, res) => {
    const out = await entry.createEntry(req);
    return res.json(out);
});

module.exports = router;