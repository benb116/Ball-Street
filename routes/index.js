const router = require('express').Router();

// router.use('/users', require('./user.route'));
router.use('/contests', require('./contest.route'));
router.use('/entries', require('./entry.route'));
router.use('/offers', require('./offer.route'));
router.use('/trades', require('./trade.route'));

module.exports = router;