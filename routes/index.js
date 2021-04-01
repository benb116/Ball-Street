const router = require('express').Router();

router.use('/contests', require('./contest.route'));
router.use('/leagues', require('./entry.route'));
router.use('/nflplayer', require('./nflplayer.route'));

module.exports = router;