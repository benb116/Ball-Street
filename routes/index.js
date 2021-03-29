const router = require('express').Router();

router.use('/contests', require('./contest.route'));
router.use('/entries', require('./entry.route'));
router.use('/offers', require('./offer.route'));
router.use('/trades', require('./trade.route'));
router.use('/nflplayer', require('./nflplayer.route'));

module.exports = router;