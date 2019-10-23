const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();

const u = require('../../util.js');

// Load User model
const User = require("../../models/User");
const Offer = require("../../models/Offer");
const Market = require("../../models/Market");

const bestPrices = require('../../admin/bestPrices.js');

router.post("/", (req, res) => {
    const rawOffer = req.body;
    console.log('incoming offer', rawOffer);
    const thisoffer = u.validateOffer(rawOffer); // Clean offer input
    isContractActive(thisoffer.contractID) // Is this offer on an active contract?
    .then(() => userCanTrade(req.user, thisoffer)) // Does the user have $ or shares?
    .then((thisoffer) => findMatchingOffers(thisoffer)) // Get all existing offers that could be filled
    .then((offers) => sortOffers(offers, thisoffer)) // Sort existing offers by price then date
    .then((sortedOffers) => initTrade(sortedOffers, thisoffer)) // Begin filling orders / create a new one
    .then((returnInfo) => res.json(returnInfo)) // Send results back to user
    .then(() => bestPrices(thisoffer.contractID)) // Update the best prices for the contract
    .catch((err) => {
        console.log(err); res.status(403).json({ tradeError: err });
    });
});

function userCanTrade(reqUser, offer) {
    console.log('userCanTrade');
    return new Promise((resolve, reject) => {
        return User.findOne({ email: reqUser.email }).then(user => {
            if (!user) { return new Error('No user found'); }
            if (offer.buy) {
                const bal = user.balance;
                const balLeft = bal - (offer.quantity * offer.price);
                if (balLeft < 0) { console.log('ERR: no funds'); reject('Insufficient funds'); }
            } else {
                userShares = (offer.yes ? user.yesShares[offer.contractID] : user.noShares[offer.contractID]);
                if (userShares < offer.quantity) { console.log('ERR: no shares'); reject('Insufficient shares');}
            }
            offer.offeror = reqUser.email;
            resolve(offer);
        });
    });
}

function isContractActive(contractID) {
    console.log('isContractActive');
    const mID = u.C2M(contractID);
    return Market.findOne({ marketID: mID }).then((m) => {
        const cIDs = m.contracts.filter((c) => c.active).map((c) => c.contractID);
        if (cIDs.indexOf(contractID) == -1) {
            throw new Error('Contract not active');
        }
        return true;
    });
}

function findMatchingOffers(offer) {
    /*

    buy yes at 60
        buy no at 40 or higher - create
        sell yes at 60 or lower - trade
    buy no at 60
        buy yes at 40 or higher - create
        sell no at 60 or lower - trade
    sell yes at 40
        sell no at 60 or lower - destroy
        buy yes at 40 or higher - trade
    sell no at 40
        sell yes at 60 or lower - destroy
        buy no at 40 or higher - trade

    W X at Y
        W !X at 100-Y or !Z
        !W X at Y or Z

    W = buy, Z = lower

    */
    console.log('findMatchingOffers');
    const baseQuery = {
        contractID: offer.contractID,
        filled: false,
    };
    let priceObj = {};
    let createSharesQuery = {
        buy: offer.buy,
        yes: !offer.yes,
    };
    let tradeSharesQuery = {
        buy: !offer.buy,
        yes: offer.yes,
    };
    if (offer.buy) {
        createSharesQuery.price = {$gte: (100 - offer.price)};
        tradeSharesQuery.price = {$lte: (offer.price)};
    } else {
        createSharesQuery.price = {$lte: (100 - offer.price)};
        tradeSharesQuery.price = {$gte: (offer.price)};
    }
    console.log(createSharesQuery, tradeSharesQuery);
    Object.assign(createSharesQuery, baseQuery);
    Object.assign(tradeSharesQuery, baseQuery);
    return Offer.find({$or:[createSharesQuery,tradeSharesQuery]});
}

function sortOffers(offers, thisoffer) {
    console.log('sortOffers');
    // console.log(offers);
    if (!offers.length) { return []; }
    const normOffers = offers.map((o) => {
        o.normPrice = (o.buy == thisoffer.buy ? (100 - o.price) : o.price);
        return o;
    });
    const sortedOffers = offers.sort((a, b) => {
        let diff = a.normPrice - b.normPrice;
        if (!diff) { diff = a.date - b.date; }
        return diff;
    });
    return sortedOffers;
}

async function initTrade(offers, thisoffer) {
    console.log('INIT');
    let resOut = {
        filled: [],
        created: {},
        balance: null
    };

    let offerInd = 0;
    let out = [];
    // console.log(offers);
    while (thisoffer.quantity > 0 && offers.length >= offerInd) {
        console.log('looooop');
        console.log(thisoffer);
        if (!offers[offerInd]) { break; }
        out = await fillOffer(offers[offerInd], thisoffer);
        thisoffer = out[0];
        resOut.filled.push(out[1]);
        offerInd++;
    }

    if (thisoffer.quantity > 0) { resOut.created = await createOffer(thisoffer); }
    console.log(3);
    resOut.balance = (out[2] || null);

    console.log('Finished trade');
    return resOut;
}

async function createOffer(offer) {
    console.log('creating offer', offer);
    const newOffer = new Offer(offer);
    console.log(2);
    console.log(newOffer);
    return await newOffer.save();
}

async function fillOffer(eO, tO) {
    console.log('FILL');
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const opts = { session, new: true, useFindAndModify: false };

        const minQuantity = Math.min(eO.quantity, tO.quantity);

        const esign = (-1 + 2 * eO.buy);
        const existUser = await User.findOne({ email: eO.offeror }).session(session);
        let eY =  u.collapseShares(existUser.yesShares);
        eY[eO.contractID] = eY[eO.contractID] || 0;
        eY[eO.contractID] += (minQuantity*eO.yes * esign);
        existUser.yesShares = u.expandShares(eY);
        let eN =  u.collapseShares(existUser.noShares);
        eN[eO.contractID] = eN[eO.contractID] || 0;
        eN[eO.contractID] += (minQuantity*!eO.yes * esign);
        existUser.noShares = u.expandShares(eN);
        existUser.balance = (existUser.balance) += (eO.price*minQuantity * -esign);

        if (existUser.balance < 0) {
            console.log('aa');
            throw new Error('Insufficient balance: existing user');
        }
        if (Math.min(Object.values(existUser.yesShares)) < 0 || Math.min(Object.values(existUser.noShares)) < 0) {
            console.log('bb');
            throw new Error('Insufficient shares: existing user');
        }
        if (eY[eO.contractID] > 0 && eN[eO.contractID]) {
            console.log('cc');
            throw new Error('Existing: Own yes and no shares');
        }
        console.log('Past exist');
        
        const tsign = (-1 + 2 * tO.buy);
        const thisUser = await User.findOne({ email: tO.offeror }).session(session);
        thisUser.balance = (thisUser.balance) += (tO.price*minQuantity * -tsign);
        let tY =  u.collapseShares(thisUser.yesShares);
        tY[tO.contractID] = tY[tO.contractID] || 0;
        tY[tO.contractID] += (minQuantity*tO.yes * tsign);
        thisUser.yesShares = u.expandShares(tY);
        let tN =  u.collapseShares(thisUser.noShares);
        tN[tO.contractID] = tN[tO.contractID] || 0;
        tN[tO.contractID] += (minQuantity*!tO.yes * tsign);
        thisUser.noShares = u.expandShares(tN);

        if (thisUser.balance < 0) {
            throw new Error('Insufficient balance: this user');
        }
        if (Math.min(Object.values(thisUser.yesShares)) < 0 || Math.min(Object.values(thisUser.noShares)) < 0) {
            throw new Error('Insufficient shares: this user');
        }
        if (tY[tO.contractID] > 0 && tN[tO.contractID]) {
            console.log('cc');
            throw new Error('This: Own yes and no shares');
        }
        console.log('Past this');

        const neweO = await Offer.findByIdAndUpdate(eO._id, { $inc: { quantity: -minQuantity }, $set: { filled: (eO.quantity - minQuantity == 0) } }, opts);
        console.log('found offer');
        if (neweO.quantity < 0) {
            throw new Error('Took too many shares');
        }
        tO.quantity -= minQuantity;
        if (tO.quantity.quantity < 0) {
            throw new Error('Took too many shares');
        }
        console.log('Updated offer');

        await thisUser.save();
        console.log('222');
        await existUser.save();

        const result = {
            contractID: tO.contractID,
            buy: tO.buy,
            yes: tO.yes,
            quantity: minQuantity,
            price: tO.price
        };
        await session.commitTransaction();
        session.endSession();

        return [tO, result, thisUser.balance];
    } catch (error) {
        // If an error occurred, abort the whole transaction and
        // undo any changes that might have happened
        console.log('trade eeeerrroooorrr', error);
        await session.abortTransaction();
        session.endSession();
        throw error; // Rethrow so calling function sees error
    }
}

module.exports = router;