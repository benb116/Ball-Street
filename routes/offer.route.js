const router = require('express').Router();
const offer = require('../services/offer.service');

router.get('/', offer.getUserOffers);
router.post('/offer', offer.createOffer);
router.delete('/offer', offer.cancelOffer);

module.exports = router;