const Market = require("../models/Market");
const Offer = require("../models/Offer");
const User = require("../models/User");
// const redis = require('redis');
// const client = redis.createClient();

const u = require('../util.js');

module.exports = function bestPrices(cID) {
    console.log(cID);
    return Offer.find({contractID: cID, filled: false})
    .then(u.bestPrices)
    .then((bP) => {
        // client.set('bestPrices.'+cID, bP);
        // client.publish('priceUpdate', cID);
    })
    .catch(console.log);
};