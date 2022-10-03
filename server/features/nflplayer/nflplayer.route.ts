import express from 'express';

import routeHandler from '@util/util.route';

import getNFLPlayerOfferSummary from './services/getNFLPlayerOfferSummary.service';
import getNFLPlayerTradeVolume from './services/getNFLPlayerTradeVolume.service';
import getNFLPlayerNumAdds from './services/getNFLPlayerNumAdds.service';
import getNFLPlayerPriceHistory from './services/getNFLPlayerPriceHistory.service';

const router = express.Router({ mergeParams: true });

// Get a player's orderbook in a contest
router.get('/players/:nflplayerID/orderbook', routeHandler(getNFLPlayerOfferSummary));

// Get a player's trade statistics in a contest
router.get('/players/:nflplayerID/tradestats', routeHandler(getNFLPlayerTradeVolume));

// Get a player's add statistics in a contest
router.get('/players/:nflplayerID/addstats', routeHandler(getNFLPlayerNumAdds));

// Get a player's trade price history in a contest
router.get('/players/:nflplayerID/pricehistory', routeHandler(getNFLPlayerPriceHistory));

export default router;
