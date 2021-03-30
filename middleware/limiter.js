const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
module.exports = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // limit each token requests per windowMs
    onLimitReached: function (req, res) {
        res.status(429);
        return res.send('Too many requests. Please wait a bit');
    },
    store: new RedisStore({
        // see Configuration
    }),
});