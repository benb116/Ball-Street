// Route controller for the API
// Does not include user auth routes

import express from 'express';

import contestRouter from '../../features/contest/contest.route';
import entryRouter from '../../features/entry/entry.route';
import nfldataRouter from '../../features/nflplayer/nfldata.route';
import nflplayerRouter from '../../features/nflplayer/nflplayer.route';
import offerRouter from '../../features/offer/offer.route';
import tradeRouter from '../../features/trade/trade.route';
import authenticate from '../../middleware/authenticate';

const router = express.Router();
const contestsRouter = express.Router({ mergeParams: true });
const thecontestRouter = express.Router({ mergeParams: true });

// NFLdata is public
router.use('/nfldata/', nfldataRouter);

// For all else, require authentication
router.use(authenticate);

// Stacked routers

thecontestRouter.use('/:contestID/', entryRouter);
thecontestRouter.use('/:contestID/', offerRouter);
thecontestRouter.use('/:contestID/', tradeRouter);
thecontestRouter.use('/:contestID/', nflplayerRouter);

contestsRouter.use('/contests/', thecontestRouter);
contestsRouter.use('/contests/', contestRouter);

router.use(contestsRouter);

export default router;
