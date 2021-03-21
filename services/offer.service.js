// Offer service covers:
    // Creating and deleting an offer
    // Getting info about a user's offers across contests
const { Transaction } = require('sequelize');
const sequelize = require('../db');
const { Offer, Roster, Entry } = require('../models');
const u = require('../util');
const isoOption = {
    // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};
module.exports = {
    getUserOffers,
    createOffer,
    cancelOffer,
};

function getUserOffers(req) {
    return Offer.findAll({
        where: {
            UserId: req.user.id,
            ContestId: req.param.contestID,
            filled: false,
        }
    }).then(u.dv).then(console.log).catch(console.error);
}

function createOffer(req) {
    let obj = req.param.offerObj;
    obj.userID = req.user.id;

    return sequelize.transaction(isoOption, async (t) => {
        const rost = await Roster.findOne({
            where: {
                UserId: obj.userID,
                ContestId: obj.contestID,
                NFLPlayerId: obj.nflplayerID
            },
            transaction: t,
            lock: t.LOCK.UPDATE
        });
        if (!obj.isbid) {
            if (rost === null) { throw new Error('Player is not on roster'); }
        } else {
            if (rost) { throw new Error('Player is on roster already'); }

            // Get # of points user has
            const theentry = await Entry.findOne({
                where: {
                    UserId: obj.userID,
                    ContestId: obj.contestID,
                },
                transaction: t,
                lock: t.LOCK.UPDATE
            });
            const pts = theentry.dataValues.pointtotal;
            if (obj.price > pts) { throw new Error("User doesn't have enough points to buy"); }
        }
        return Offer.create({
            UserId: obj.userID,
            ContestId: obj.contestID,
            NFLPlayerId: obj.nflplayerID,
            isbid: obj.isbid,
            price: obj.price,
        }, {
            transaction: t,
            lock: t.LOCK.UPDATE
        })
        .catch(err => {
            throw new Error("Offer create error: " + err.original.detail);
        });
    })
    .then(u.dv).then(offer => {
        console.log('Add offer to queue');
        return offer;
    });


    // Do they have this player on their roster?
    // Can user submit offer? bid
        // Do they have the funds?
        // Do they have a spot on their roster?
    // Can user submit offer? ask

}

function cancelOffer(req) {
    return Offer.destroy({
        where: {
            id: req.param.offerID
        }
    });
}
