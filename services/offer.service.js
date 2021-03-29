// Offer service covers:
    // Creating and deleting an offer
    // Getting info about a user's offers across contests
const { Transaction } = require('sequelize');
const Queue = require('bull');
const sequelize = require('../db');
const { Offer, Roster, Entry, NFLPlayer } = require('../models');
const u = require('../util');
const config = require('../config');
const isoOption = {
    // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const offerQueue = new Queue('offer-queue');

module.exports = {
    getUserOffers,
    createOffer,
    cancelOffer,
};

function getUserOffers(req) {
    return Offer.findAll({
        where: {
            UserId: req.session.user.id,
            ContestId: req.params.contestID,
            filled: false,
            cancelled: false
        }
    }).then(u.dv).then(console.log).catch(console.error);
}

function createOffer(req) {
    let obj = req.params.offerObj;
    obj.userID = req.session.user.id;

    return sequelize.transaction(isoOption, async (t) => {
        const theentry = await Entry.findOne({
            where: {
                UserId: obj.userID,
                ContestId: obj.contestID,
            },
            transaction: t,
            lock: t.LOCK.UPDATE
        });
        
        const isOnTeam = u.isPlayerOnRoster(theentry, obj.nflplayerID);
        if (!obj.isbid) {
            if (!isOnTeam) { throw new Error('Player is not on roster'); }
        } else {
            if (isOnTeam) {throw new Error('Player is on roster'); }
            const pts = theentry.dataValues.pointtotal;
            if (obj.price > pts) { throw new Error("User doesn't have enough points to buy"); }
            const playerdata = await NFLPlayer.findByPk(obj.nflplayerID, {
                attributes: ['NFLPositionId'],
                transaction: t
            }).then(d => d.dataValues);
            if (!u.isOpenRoster(theentry, playerdata.NFLPositionId)) { throw new Error("There are no spots this player could fit into"); }
        }

        return Offer.create({
            UserId: obj.userID,
            ContestId: obj.contestID,
            NFLPlayerId: obj.nflplayerID,
            isbid: obj.isbid,
            price: obj.price,
            protected: obj.protected || config.DefaultProtected
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
        offerQueue.add(offer);
        return offer;
    });


    // Do they have this player on their roster?
    // Can user submit offer? bid
        // Do they have the funds?
        // Do they have a spot on their roster?
    // Can user submit offer? ask

}

function cancelOffer(req) {
    return sequelize.transaction(isoOption, async (t) => {
        const o = await Offer.findByPk(req.params.offerID, u.tobj(t));
        if (!o) { throw new Error('No offer found'); }
        if (o.filled) { throw new Error('Offer already filled'); }
        o.cancelled = true;
        await o.save({transaction: t});
        return o;
    });
}
