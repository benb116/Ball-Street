const router = require('express').Router();
const authenticate = require('./middleware/authenticate');

router.use(authenticate);

const leaguesRouter = require('express').Router();
const leagueRouter = require('express').Router();
const contestsRouter = require('express').Router();
const contestRouter = require('express').Router();

// /leagues/:leagueID/contests/:contestID/...

contestRouter.use('/:contestID/', require('./features/entry/entry.route'));
contestRouter.use('/:contestID/', require('./features/offer/offer.route'));
contestRouter.use('/:contestID/', require('./features/trade/trade.route'));
contestRouter.use('/:contestID/', require('./features/nflplayer/nflplayer.route'));

contestsRouter.use('/contests/',  contestRouter);
contestsRouter.use('/contests/',  require('./features/contest/contest.route'));

leagueRouter.use('/:leagueID/', contestsRouter);

leaguesRouter.use('/leagues/', leagueRouter);
leaguesRouter.use('/leagues/', require('./features/league/league.route'));

router.use(leaguesRouter);

module.exports = router;