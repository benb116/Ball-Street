import express from 'express';

import routeHandler from '../util/util.route';

import getContestEntries from './services/getContestEntries.service';
import getEntry from './services/getEntry.service';
import createEntry from './services/createEntry.service';
import reorderRoster from './services/reorderRoster.service';
import limited from '../../middleware/rateLimiter';

const router = express.Router({ mergeParams: true });

// Get all entries in a contest
router.get('/entries', routeHandler(getContestEntries));

// Get a user's entry in a contest
router.get('/entry', routeHandler(getEntry));

// Create a user's entry in a contest
router.post('/entry', routeHandler(createEntry));

// Reorder a roster in an entry
router.put('/entry', limited(20), routeHandler(reorderRoster));

export default router;
