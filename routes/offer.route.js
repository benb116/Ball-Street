const router = require('express').Router();
const offer = require('../services/offer.service');
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate, async (req, res) => {
    const out = await offer.getUserOffers(req);
    return res.json(out);
});

router.post('/offer', authenticate, async (req, res) => {
    const out = await offer.createOffer(req);
    return res.json(out);
});

router.delete('/offer', authenticate, async (req, res) => {
    const out = await offer.cancelOffer(req);
    return res.json(out);
});

router.get('/backlog', async (req, res) => {
    const out = await offer.getOfferBacklog();
    return res.json(out);
});

module.exports = router;