const express = require("express");
const router = express.Router();

// Load User model
const Market = require("../../models/Market");

router.get("/", (req, res) => {
    // Find user by email
    Market.find({ active: true }).then(markets => {
        return res.json(markets);
    });
});

router.get("/:marketID", (req, res) => {
    // Find user by email
    console.log(req.params);
    Market.findOne({ marketID: req.params.marketID }).then(market => {
        if (!market) { return res.status(404).json({ marketnotfound: "Market not found" }); }
        return res.json(market);
    });
});
module.exports = router;
