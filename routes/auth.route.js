const router = require('express').Router();
const auth = require('../services/auth.service');

// TODO validation

router.post('/login',  async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json('Bad request paramss');
    }

    try {
        const user = await auth.login(email, password);
        req.session.user = user; // add to session
        res.sendStatus(204);
    } catch(err) {
        console.error(err);
        res.status(401).json(err);
    }
});

router.post('/signup', async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json('Bad request paramss');
    }
    try {
        const user = await auth.signup(email, password);
        req.session.user = user; // add to session
        res.sendStatus(204);
    } catch(err) {
        console.error(err);
        res.status(401).json(err);
    }
});

router.delete('/logout', function (req, res) {
  req.session.destroy(function () {
    res.send({ result: 'OK', message: 'Session destroyed' });
  });
});

module.exports = router;