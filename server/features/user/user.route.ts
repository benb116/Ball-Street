import express from 'express';

import routeHandler from '../util/util.route';

import authenticate from '../../middleware/authenticate';

import getAccount from './services/getAccount.service';
import withdraw from './services/withdraw.service';
import deposit from './services/deposit.service';
import getUserLedger from '../ledger/services/getUserLedger.service';
import forceLogout from './services/forceLogout.service';

const router = express.Router();

router.get('/account', authenticate, routeHandler(getAccount));

router.post('/deposit', authenticate, routeHandler(deposit));
router.post('/withdraw', authenticate, routeHandler(withdraw));
router.get('/ledger/:page', authenticate, routeHandler(getUserLedger));

router.delete('/logout', authenticate, (req, res) => {
  req.session.destroy(() => {
    res.send({ result: 'OK', message: 'Session destroyed' });
  });
});
router.delete('/forcelogout', authenticate, routeHandler(forceLogout));

export default router;
