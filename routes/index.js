const router = require('express').Router();

router.use('/contests/', require('./contest.route'));
router.use('/leagues/', require('./league.route'));
router.use('/nflplayers/', require('./nflplayer.route'));

module.exports = router;