const router = require('express').Router();
const entry = require('../services/entry.service');

const { routeHandler } = require('./util.route');

// Get all entries in a contest
router.get('/entries', routeHandler(entry.getContestEntries));

// Get a user's entry in a contest
router.get('/entry', routeHandler(entry.getEntry));

// Create a user's entry in a contest
router.post('/entry', routeHandler(entry.createEntry));

module.exports = router;