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
const protectedQueue = new Queue('protected-queue');

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
        // Find user's entry
        const theentry = await Entry.findOne({
            where: {
                UserId: obj.userID,
                ContestId: obj.contestID,
            },
            transaction: t,
            lock: t.LOCK.UPDATE
        });
        
        // Player should be in entry for ask, not for bid
        const isOnTeam = u.isPlayerOnRoster(theentry, obj.nflplayerID);
        if (!obj.isbid) {
            if (!isOnTeam) { throw new Error('Player is not on roster'); }
        } else {
            if (isOnTeam) {throw new Error('Player is on roster already'); }

            const pts = theentry.dataValues.pointtotal;
            if (obj.price > pts) { throw new Error("User doesn't have enough points to offer"); }
            
            const playerdata = await NFLPlayer.findByPk(obj.nflplayerID, {
                attributes: ['NFLPositionId'],
                transaction: t
            }).then(u.dv);
            // Only allow offer if there's currently room on the roster
            // TODO make linked offers? I.e. sell player at market price to make room for other player
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
        });
    })
    .then(u.dv).then(offer => {
        console.log('Add offer to queue');
        offerQueue.add(offer);
        return offer;
    });
}

function cancelOffer(req) {
    // Cancel offer, but if it's filled, let user know
    return sequelize.transaction(isoOption, async (t) => {
        const o = await Offer.findByPk(req.params.offerID, u.tobj(t));
        if (!o) { throw new Error('No offer found'); }
        if (o.filled) { throw new Error('Offer already filled'); }
        o.cancelled = true;
        await o.save({transaction: t});
        return o;
    });
}

async function getOfferBacklog() {
    return Promise.all([
        offerQueue.getJobCounts(),
        protectedQueue.getJobCounts(),
    ]);
}

module.exports = {
    getUserOffers,
    createOffer,
    cancelOffer,
    getOfferBacklog,
};