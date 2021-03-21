// Trade service covers:
    // Adding and dropping pregame
    // Submitting and cancelling offers
const { Transaction } = require('sequelize');
const sequelize = require('../db');
const { Roster, Entry, NFLPlayer, RosterPosition, Offer, ProtectedMatch, Trade } = require('../models');
const u = require('../util');
const isoOption = {
    // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

module.exports = {
    preTradeAdd,
    preTradeDrop,
};

function preTradeAdd(req) {
    return sequelize.transaction(isoOption, async (t) => {

        // Get # of points user has
        const theentry = await Entry.findOne({
            where: {
                UserId: req.user.id,
                ContestId: req.param.contestID
            },
            transaction: t,
            lock: t.LOCK.UPDATE
        });
        const pts = theentry.dataValues.pointtotal;
        console.log("POINTS", pts);

        // Get player price and position
        const playerdata = await NFLPlayer.findByPk(req.param.nflplayerID, {
            attributes: ['preprice', 'NFLPositionId'],
            transaction: t
        }).then(d => d.dataValues);
        console.log("PDATA", playerdata);

        // Checks
        if (!playerdata.preprice) { throw new Error("Player has no price"); }
        if (playerdata.preprice > pts) { throw new Error("User doesn't have enough points"); }
          
        if (req.param.rosterpositionID >= 0) {
            // Try to add to roster
            // (There are model-level validations too)
            const newroster = await Roster.create({
                UserId: req.user.id,
                ContestId: req.param.contestID,
                NFLPlayerId: req.param.nflplayerID,
                RosterPositionId: req.param.rosterpositionID
            }, {
                transaction: t,
            })
            .catch(err => {
                throw new Error("Roster create error: " + err.original.detail);
            });

            // Deduct cost from points
            theentry.pointtotal -= playerdata.preprice;
            await theentry.save({transaction: t});

            return u.dv([newroster, theentry]);
        } else {
            throw new Error("Select a roster position to put this player into");
        }
    });
}

function preTradeDrop(req) {
    return sequelize.transaction(isoOption, async (t) => {

        // Remove from roster
        const oldroster = await Roster.destroy({
            where: {
                UserId: req.user.id,
                ContestId: req.param.contestID,
                NFLPlayerId: req.param.nflplayerID,
            }
        }, {
            transaction: t,
            lock: t.LOCK.UPDATE
        });
        if (!oldroster) { throw new Error("That player wasn't on the roster"); }

        // How much to add to point total
        const preprice = await NFLPlayer.findByPk(req.param.nflplayerID, {
            attributes: ['preprice'],
            transaction: t
        }).then(d => d.dataValues.preprice);

        // Find and update
        // Want to be able to return entry
        const theentry = await Entry.findOne({
            where: {
                UserId: req.user.id,
                ContestId: req.param.contestID
            }
        }, {
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        // Deduct cost from points
        theentry.pointtotal += preprice;
        await theentry.save({transaction: t});

        return u.dv(theentry);
    });
}