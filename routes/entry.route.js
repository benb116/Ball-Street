const router = require('express').Router();
const entry = require('../services/entry.service');

router.get('/', entry.getUserEntries);
router.get('/entry', entry.getEntry);
router.post('/entry', entry.createEntry);

module.exports = router;