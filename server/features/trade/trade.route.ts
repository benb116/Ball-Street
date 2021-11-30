import * as express from 'express'

const router = express.Router({ mergeParams: true });
import routeHandler from '../util/util.route'

import getUserTrades from './services/getUserTrades.service'
import preTradeAdd from './services/preTradeAdd.service'
import preTradeDrop from './services/preTradeDrop.service'

// Show a user's trades in a contest
router.get('/trades', routeHandler(getUserTrades));

// Pre-add a player in a contest
router.post('/add', routeHandler(preTradeAdd));

// Pre-drop a player in a contest
router.post('/drop', routeHandler(preTradeDrop));

export default router;
