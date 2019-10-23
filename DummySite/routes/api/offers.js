const express = require("express");
const router = express.Router();

// Load User model
const Offer = require("../../models/Offer");

router.get("/:contractID", (req, res) => {
    Market.find({ contractID: req.params.contractID, filled: false }).then(offers => {
        return res.json(offers);
    });
});

router.delete("/cancel/:offerID", (req, res) => {
    console.log('cancel', req.params.offerID);
    // TODO: Require User to authorize
    // Find user by email
    Market.deleteOne({ _id: req.params.offerID })
    .then(result => res.json({
        'cancelled': true,
        'offerID': req.params.offerID
    })).catch(err => res.json({
        'cancelled': false,
        'offerID': req.params.offerID,
        'err': err
    }));
});

module.exports = router;
