const router = require('express').Router();
const service = require('./user.service');
const authenticate = require('../../middleware/authenticate');

const { routeHandler } = require('../util/util.route');

// TODO validation

router.post('/login',  async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json('Bad request params');
    }
    try {
        const user = await service.login(email, password);
        req.session.user = user; // add to session
        res.json(user);
    } catch(err) {
        res.status(401).json(err);
    }
});

router.get('/account', authenticate, routeHandler(service.getAccount));

router.post('/signup', async (req, res) => {
    const {name, email, password} = req.body;
    if (!name || !email || !password) {
        return res.status(400).json('Bad request params');
    }
    try {
        const user = await service.signup(name, email, password);
        req.session.user = user; // add to session
        res.json(user);
    } catch(err) {
        res.status(401).json(err);
    }
});

router.delete('/logout', authenticate, function (req, res) {
    console.log('logout');
  req.session.destroy(function () {
    res.send({ result: 'OK', message: 'Session destroyed' });
  });
});

module.exports = router;