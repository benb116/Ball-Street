const router = require('express').Router();
const authenticate = require('../middleware/authenticate');

router.use(authenticate);

router.use('/leagues/', require('./league.route'));
router.use('/nfldata/', require('./nfldata.route'));

module.exports = router;