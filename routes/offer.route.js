const router = require('express').Router();
const offer = require('../services/offer.service');

// Get a user's offers in a contest
router.get('/offers', async (req, res) => {
    const out = await offer.getUserOffers(req);
    return res.json(out);
});

// Make a new offer in a contest
router.post('/offer', async (req, res) => {
    const out = await offer.createOffer(req);
    return res.json(out);
});

// Cancel an offer in a contest
router.delete('/offer', async (req, res) => {
    const out = await offer.cancelOffer(req);
    return res.json(out);
});

module.exports = router;