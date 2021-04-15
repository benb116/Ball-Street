const router = require('express').Router();
const offer = require('../services/offer.service');

const { routeHandler } = require('./util.route');

// Get a user's offers in a contest
router.get('/offers', routeHandler(offer.getUserOffers));

// Make a new offer in a contest
router.post('/offer', routeHandler(offer.createOffer));

// Cancel an offer in a contest
router.delete('/offer', routeHandler(offer.cancelOffer));

module.exports = router;
