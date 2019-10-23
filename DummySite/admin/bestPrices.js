const Market = require("../models/Market");
const Offer = require("../models/Offer");
const User = require("../models/User");
const redis = require('redis');
const client = redis.createClient();

const u = require('../util.js');

module.exports = function bestPrices(cID, mute) {
    console.log(cID);
    return Offer.find({contractID: cID, filled: false})
    .then(u.bestPrices)
    .then((bP) => {
        console.log(bP);
        // client.set('bestPrices-'+cID, bP);
        if (!mute) { client.publish('priceUpdate', cID); }
    })
    .catch(console.log);
};