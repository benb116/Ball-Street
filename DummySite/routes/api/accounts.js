const express = require("express");
const router = express.Router();

// Load User model
const User = require("../../models/User");

router.get("/info", (req, res) => {
    // Find user by email
    const email = req.user.email;
    User.findOne({ email }, '-password -__v -_id').then(user => {
        if (!user) { return res.status(404).json({ usernotfound: "User not found" }); }
        return res.json((user));
    });
});

function stripUserSensitive(user) {
    return {
        balance: user.balance,
        date: user.date,
        email: user.email,
        name: user.name,
        shares: user.shares,
        transactionHistory: user.transactionHistory,
    };
}

module.exports = router;
