import express from 'express';

import authenticate from '../../middleware/authenticate';
import routeHandler from '../util/util.route';

import getPortfolioBalance from './services/getPortfolioBalance.service';

const router = express.Router();

router.get('/balance', authenticate, routeHandler(getPortfolioBalance));

export default router;
