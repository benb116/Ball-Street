const express = require("express");
const router = express.Router();

// Load User model
const Offer = require("../../models/Offer");

router.get("/:contractID", (req, res) => {
    Market.find({ contractID: req.params.contractID }).then(offers => {
        return res.json(offers);
    });
});

router.delete("/cancel/:offerID", (req, res) => {
    // TODO: Require User to authorize
    // Find user by email
    Market.deleteOne({ offerID: req.params.offerID })
    .then(result => res.send(`Deleted ${result.deletedCount} item.`))
    .catch(err => res.send(`Delete failed with error: ${err}`));
});

module.exports = router;
