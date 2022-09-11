import express from 'express';
import limited from '../../middleware/rateLimiter';
import routeHandler from '../util/util.route';

import getUserTrades from './services/getUserTrades.service';
import preTradeAdd from './services/preTradeAdd.service';
import preTradeDrop from './services/preTradeDrop.service';

const router = express.Router({ mergeParams: true });

// Show a user's trades in a contest
router.get('/trades', routeHandler(getUserTrades));

const addDropLimiter = limited(20);

// Pre-add a player in a contest
router.post('/add', addDropLimiter, routeHandler(preTradeAdd));

// Pre-drop a player in a contest
router.post('/drop', addDropLimiter, routeHandler(preTradeDrop));

export default router;
