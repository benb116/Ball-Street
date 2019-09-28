const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();

// Load User model
const User = require("../../models/User");
const Offer = require("../../models/Offer");
const Market = require("../../models/Market");

router.post("/", (req, res) => {
    const thisoffer = req.body;
    // Promise.all([userCanTrade(req.user, thisoffer), isContractActive(thisoffer.contractID)])
    // .then((out) => {
    //     console.log('e', out);
    //     findMatchingOffers(thisoffer);
    // });
    findMatchingOffers(thisoffer) 
    .then((offers) => sortOffers(offers, thisoffer))
    .then((sortedOffers) => initTrade(sortedOffers, thisoffer))
    .catch((err) => res.status(403).json({ tradeError: err }));
});

function userCanTrade(reqUser, offer) {
    console.log('userCanTrade');
    return User.findOne({ email: reqUser.email }).then(user => {
        // console.log('user', JSON.striify(user));
        if (!user) { return new Error('No user found'); }
        if (offer.buy) {
            const bal = user.balance;
            const balLeft = bal - (offer.quantity * offer.price);
            if (balLeft < 0) { throw new Error('Insufficient funds'); console.log('funds'); }
        } else {
            if (offer.yes) {
                if (user.yesShares[offer.contractID] < offer.quantity) { throw new Error('Insufficient shares'); console.log('shares');}
            } else {
                if (user.noShares[offer.contractID] < offer.quantity) { throw new Error('Insufficient shares'); console.log('shares');}
            }
        }
        return true;
    });
}

function isContractActive(contractID) {
    const mID = C2M(contractID);
    return Market.findOne({ marketID: mID }).then((m) => {
        console.log('market', JSON.stringify(m));
        const cIDs = m.contracts.filter((c) => c.active).map((c) => c.contractID);
        console.log((cIDs.indexOf(contractID) > -1));
        if (cIDs.indexOf(contractID) == -1) {
            throw new Error('Contract not active');
        }
        return true;
    });
}

function C2M(cID) { return cID.split('-')[0]; }

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
    Object.assign(createSharesQuery, baseQuery);
    Object.assign(tradeSharesQuery, baseQuery);
    return Offer.find({$or:[createSharesQuery,tradeSharesQuery]});
}

function sortOffers(offers, thisoffer) {
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
    // While thisoffer.quantity > 0
    // fill offer[0]
    console.log('yeyeye');
    console.log(thisoffer.quantity, offers.length);
    let offerInd = 0;
    while (thisoffer.quantity > 0 && offers.length >= offerInd && offers.length) {
        console.log('looooop');
        thisoffer = await fillOffer(offers[offerInd], thisoffer);
        offerInd++;
    }
    console.log(thisoffer.quantity, offers.length);

    if (thisoffer.quantity > 0 && offers.length == 0) { return createOffer(thisoffer); }
}

function createOffer(offer) {
    console.log('eee', offer);
    const newOffer = new Offer(offer);
    return newOffer.save();
}

function collapseShares(sharesArray) {
    return sharesArray.reduce((acc, cur, i) => {
        const cID = cur.contractID;
        acc[cID] = (acc[cID] + cur.quantity) || cur.quantity;
        return acc;
    }, {});
}

function expandShares(sharesObj) {
    return Object.keys(sharesObj).map((cID) => {
        return {
            contractID: cID,
            quantity: sharesObj[cID]
        };
    });
}

async function fillOffer(eO, tO) {
    console.log('FILL');
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const opts = { session, new: true, useFindAndModify: false };

        const minQ = Math.min(eO.quantity, tO.quantity);
        console.log(minQ);

        const esign = (-1 + 2 * eO.buy);
        const existUser = await User.findOne({ email: eO.offeror }).session(session);
        let eY =  collapseShares(existUser.yesShares);
        eY[eO.contractID] = eY[eO.contractID] || 0;
        eY[eO.contractID] += (minQ*eO.yes * esign);
        existUser.yesShares = expandShares(eY);
        let eN =  collapseShares(existUser.noShares);
        eN[eO.contractID] = eN[eO.contractID] || 0;
        eN[eO.contractID] += (minQ*!eO.yes * esign);
        existUser.noShares = expandShares(eN);
        existUser.balance = (existUser.balance) += (eO.price*minQ * -esign);
        console.log(existUser);

        console.log('yeet');

        if (existUser.balance < 0) {
            console.log('aa');
            throw new Error('Insufficient balance: ');
        }
        if (Math.min(Object.values(existUser.yesShares)) < 0 || Math.min(Object.values(existUser.yesShares)) < 0) {
            console.log('bb');
            throw new Error('Insufficient shares: ');
        }
        console.log('2');
        

        // let tdelta = {
        //     balance: tO.price*minQ * -tsign,
        //     yesShares: {},
        //     noShares: {},
        // };
        // tdelta.yesShares[tO.contractID] = minQ*tO.yes * tsign;
        // tdelta.noShares[tO.contractID] = minQ*tO.yes * tsign;

        // const thisUser = await User.findOneAndUpdate({ email: tO.offeror }, { $inc: tdelta }, opts);


        const tsign = (-1 + 2 * tO.buy);
        const thisUser = await User.findOne({ email: tO.offeror }).session(session);
        thisUser.balance = (thisUser.balance) += (tO.price*minQ * -tsign);
        let tY =  collapseShares(thisUser.yesShares);
        tY[tO.contractID] = tY[tO.contractID] || 0;
        tY[tO.contractID] += (minQ*tO.yes * tsign);
        thisUser.yesShares = expandShares(tY);
        let tN =  collapseShares(thisUser.noShares);
        tN[tO.contractID] = tN[tO.contractID] || 0;
        tN[tO.contractID] += (minQ*!tO.yes * tsign);
        thisUser.noShares = expandShares(tN);
        console.log(thisUser);

        console.log(3);
        if (thisUser.balance < 0) {
            throw new Error('Insufficient balance: ');
        }
        if (Math.min(Object.values(thisUser.yesShares)) < 0 || Math.min(Object.values(thisUser.yesShares)) < 0) {
            throw new Error('Insufficient shares: ');
        }

        await existUser.save();
        await thisUser.save();

        console.log(4);
        // modify offerobjs
        const neweO = await Offer.findByIdAndUpdate(eO._id, { $inc: { quantity: -minQ }, $set: { filled: (eO.quantity - minQ == 0) } }, opts);
        if (neweO.quantity < 0) {
            throw new Error('Took too many shares');
        }
        tO.quantity -= minQ;
        if (tO.quantity.quantity < 0) {
            throw new Error('Took too many shares');
        }
        console.log(5);
        await session.commitTransaction();
        session.endSession();
        return tO;
    } catch (error) {
        // If an error occurred, abort the whole transaction and
        // undo any changes that might have happened
        console.log('eeeerrroooorrr', error);
        await session.abortTransaction();
        session.endSession();
        throw error; // Rethrow so calling function sees error
    }
}

// function handleMoneyTransfer(senderAccountId, receiveAccountId, amount) {
//   // connect the DB and get the User Model
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     // always pass session to find queries when the data is needed for the transaction session
//     const sender = await User.findOne({ accountId: senderAccountId }).session(session);
    
//     // calculate the updated sender balance
//     sender.balance = $(sender.balance).subtract(amount);
    
//     // if funds are insufficient, the transfer cannot be processed
//     if (sender.balance < 0) {
//       throw new Error(`User - ${sender.name} has insufficient funds`);
//     }
    
//     // save the sender updated balance
//     // do not pass the session here
//     // mongoose uses the associated session here from the find query return
//     // more about the associated session ($session) later on
//     await sender.save();
    
//     const receiver = await User.findOne({ accountId: receiverAccountId }).session(session);
    
//     receive.balance = $(receiver.balance).add(amount);
    
//     await receiver.save();
    
//     // commit the changes if everything was successful
//     await session.commitTransaction();
//   } catch (error) {
//     // if anything fails above just rollback the changes here
  
//     // this will rollback any changes made in the database
//     await session.abortTransaction();
    
//     // logging the error
//     console.error(error);
    
//     // rethrow the error
//     throw error;
//   } finally {
//     // ending the session
//     session.endSession();
//   }
// }

module.exports = router;