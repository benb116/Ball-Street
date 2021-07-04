// Route controller for the API
// Does not include user auth routes

const router = require('express').Router();
const leaguesRouter = require('express').Router({ mergeParams: true });
const leagueRouter = require('express').Router({ mergeParams: true });
const contestsRouter = require('express').Router({ mergeParams: true });
const contestRouter = require('express').Router({ mergeParams: true });

const authenticate = require('./middleware/authenticate');

// NFLdata is public
router.use('/nfldata/', require('./features/nflplayer/nfldata.route'));

// For all else, require authentication
router.use(authenticate);

// Stacked routers
// /leagues/:leagueID/contests/:contestID/...

contestRouter.use('/:contestID/', require('./features/entry/entry.route'));
contestRouter.use('/:contestID/', require('./features/offer/offer.route'));
contestRouter.use('/:contestID/', require('./features/trade/trade.route'));
contestRouter.use('/:contestID/', require('./features/nflplayer/nflplayer.route'));

contestsRouter.use('/contests/', contestRouter);
contestsRouter.use('/contests/', require('./features/contest/contest.route'));

leagueRouter.use('/:leagueID/', contestsRouter);

leaguesRouter.use('/leagues/', leagueRouter);
leaguesRouter.use('/leagues/', require('./features/league/league.route'));

router.use(leaguesRouter);

module.exports = router;
