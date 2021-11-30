import * as express from 'express'

const router = express.Router({ mergeParams: true });

import routeHandler from '../util/util.route'

import getContest from './services/getContest.service'
import getContests from './services/getContests.service'


// Get all contests
router.get('/', routeHandler(getContests));

// Get a specific contest
router.get('/:contestID', routeHandler(getContest));

export default router;
