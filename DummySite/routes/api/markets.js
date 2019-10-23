const express = require("express");
const router = express.Router();

// Load User model
const Market = require("../../models/Market");
const Offer = require("../../models/Offer");

router.get("/", (req, res) => {
    console.log('2');
    Offer.find({filled: false}).then(offers => {
        const map = offers.reduce((m, o) => {
            if (!m[o.contractID]) { m[o.contractID] = [Infinity, Infinity]; }
            let p = 100 - o.price;
            let ind = (o.yes ? 1 : 0);
            if (!o.buy) { p = 100 - p; ind = 1 - ind; }
            if (m[o.contractID][ind] > p) { m[o.contractID][ind] = p; }
            return m;
        }, {});
        console.log(map);
    });
    Market.find({ active: true }).then(markets => {
        return res.json(markets);
    });
});

router.get("/:marketID", (req, res) => {
    Market.findOne({ marketID: req.params.marketID }).then(market => {
        if (!market) { return res.status(404).json({ marketnotfound: "Market not found" }); }
        return res.json(market);
    });
});

module.exports = router;
