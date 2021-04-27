const router = require('express').Router({ mergeParams: true });

const entry = require('./entry.service');
const { routeHandler } = require('../util/util.route');

// Get all entries in a contest
router.get('/entries', routeHandler(entry.getContestEntries));

// Get a user's entry in a contest
router.get('/entry', routeHandler(entry.getEntry));

// Create a user's entry in a contest
router.post('/entry', routeHandler(entry.createEntry));

// Reorder a roster in an entry
router.put('/entry', routeHandler(entry.reorderRoster));

module.exports = router;
