import * as express from 'express';
import routeHandler from '../util/util.route';

import getUserOffers from './services/getUserOffers.service';
import createOffer from './services/createOffer.service';
import cancelOffer from './services/cancelOffer.service';

const router = express.Router({ mergeParams: true });

// Get a user's offers in a contest
router.get('/offers', routeHandler(getUserOffers));

// Make a new offer in a contest
router.post('/offer', routeHandler(createOffer));

// Cancel an offer in a contest
router.delete('/offer', routeHandler(cancelOffer));

export default router;
