const router = require('express').Router();
const offer = require('../services/offer.service');
const authenticate = require('../middleware/authenticate');

// Get a user's offers in a contest
router.get('/:contestID/offers', authenticate, async (req, res) => {
    const out = await offer.getUserOffers(req);
    return res.json(out);
});

// Make a new offer in a contest
router.post('/:contestID/offer', authenticate, async (req, res) => {
    const out = await offer.createOffer(req);
    return res.json(out);
});

// Cancel an offer in a contest
router.delete('/:contestID/offer', authenticate, async (req, res) => {
    const out = await offer.cancelOffer(req);
    return res.json(out);
});

module.exports = router;