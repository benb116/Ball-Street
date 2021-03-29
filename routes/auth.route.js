const router = require('express').Router();
const auth = require('../services/auth.service');

router.post('/login',  async (req, res) => {
    const {email, password} = req.body;

    // perform payload validation
    // in prod, always use a validation library like joi
    // for this tutorial, we only do basic validation
    if (!email || !password) {
        return res.status(400).json('Bad request paramss');
    }

    try {
        const user = await auth.login(email, password);
        req.session.user = user;
        res.sendStatus(204);
    } catch(err) {
        // in prod, do not use console.log or console.error
        // use a proper logging library like winston
        console.error(err);
        res.status(401).json(err);
    }
});

router.post('/signup', async (req, res) => {
    const {email, password} = req.body;
    // perform payload validation
    // in prod, always use a validation library like joi
    // for this tutorial, we only do basic validation
    if (!email || !password) {
        return res.status(400).json('Bad request paramss');
    }
    try {
        const user = await auth.signup(email, password);
        req.session.user = user;
        res.sendStatus(204);
    } catch(err) {
        // in prod, do not use console.log or console.error
        // use a proper logging library like winston
        console.error(err);
        res.status(401).json(err);
    }
});

module.exports = router;