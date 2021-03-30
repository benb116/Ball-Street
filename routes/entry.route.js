const router = require('express').Router();
const entry = require('../services/entry.service');
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate, async (req, res) => {
    const out = await entry.getUserEntries(req);
    return res.json(out);
});

router.get('/entry', authenticate, async (req, res) => {
    const out = await entry.getEntry(req);
    return res.json(out);
});

router.post('/entry', authenticate, async (req, res) => {
    const out = await entry.createEntry(req);
    return res.json(out);
});

module.exports = router;