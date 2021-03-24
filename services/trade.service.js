// Trade service covers:
    // Adding and dropping pregame
    // Submitting and cancelling offers
const { Transaction } = require('sequelize');
const sequelize = require('../db');
const { Roster, Entry, NFLPlayer, RosterPosition, Offer, ProtectedMatch, Trade } = require('../models');
const u = require('../util');
const config = require('../config');
const isoOption = {
    // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

module.exports = {
    preTradeAdd,
    preTradeDrop,
};

function preTradeAdd(req) {
    return sequelize.transaction(isoOption, async (t) => {
        const _player = req.param.nflplayerID;
        // Get user entry
        const theentry = await Entry.findOne({
            where: {
                UserId: req.user.id,
                ContestId: req.param.contestID
            },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        // Determine if user already has player on roster
        const isOnTeam = u.isPlayerOnRoster(theentry, _player);
        if (isOnTeam) { throw new Error('Player is on roster'); }

        const pts = theentry.dataValues.pointtotal;
        console.log("POINTS", pts);

        // Get player price and position
        const playerdata = await NFLPlayer.findByPk(_player, {
            attributes: ['preprice', 'NFLPositionId'],
            transaction: t
        }).then(d => d.dataValues);
        console.log("PDATA", playerdata);

        // Checks
        if (!playerdata.preprice) { throw new Error("Player has no price"); }
        if (playerdata.preprice > pts) { throw new Error("User doesn't have enough points"); }
          
        // Deduct cost from points
        theentry.pointtotal -= playerdata.preprice;

        const playerType = playerdata.NFLPositionId;
        if (req.param.rosterposition) { // If a roster position was specified
            // Is it a valid one?
            const isinvalid = u.isInvalidSpot(playerType, req.param.rosterposition);
            if (isinvalid) { throw new Error(isinvalid); }
            // Is it an empty one?
            if (theentry[req.param.rosterposition] !== null) {
                throw new Error('There is a player in that spot');
            }
            theentry[req.param.rosterposition] = _player;

        } else {
            // Find an open spot
            const isOpen = u.isOpenRoster(theentry, playerType);
            if (!isOpen) { throw new Error('There are no open spots'); }
            theentry[isOpen] = _player;
        }
        await theentry.save({transaction: t});

        return u.dv(theentry);
    });
}

function preTradeDrop(req) {
    return sequelize.transaction(isoOption, async (t) => {

        // Remove from roster
        const theentry = await Entry.findOne({
            where: {
                UserId: req.user.id,
                ContestId: req.param.contestID
            },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        const isOnTeam = u.isPlayerOnRoster(theentry, req.param.nflplayerID);
        if (!isOnTeam) { throw new Error('Player is not on roster'); }
        theentry[isOnTeam] = null;

        // How much to add to point total
        const preprice = await NFLPlayer.findByPk(req.param.nflplayerID, {
            attributes: ['preprice'],
            transaction: t
        }).then(d => d.dataValues.preprice);

        // Deduct cost from points
        theentry.pointtotal += preprice;
        await theentry.save({transaction: t});

        return u.dv(theentry);
    });
}