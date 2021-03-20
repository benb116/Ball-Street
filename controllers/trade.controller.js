// Trade controller covers:
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

function preTradeDrop() {

}

function preTradeAdd(req, res) {
    return sequelize.transaction(isoOption, async (t) => {
        // user
        // contest
            // can get entry and pt total
        // nflplayer
        // rosterposition (optional)

        // Get entry point total
        // Get NFLplayer preprice

        const theentry = await Entry.findOne({
            where: {
                UserId: req.user.id,
                ContestId: req.param.contestID
            },
            transaction: t,
            lock: Transaction.LOCK.UPDATE
        });
        const pts = theentry.dataValues.pointtotal;
        console.log("POINTS", pts);

        const playerdata = await NFLPlayer.findByPk(req.param.nflplayerID, {
            attributes: ['preprice', 'NFLPositionId'],
            transaction: t
        }).then(d => d.dataValues);
        console.log("PDATA", playerdata);

        if (playerdata.preprice > pts) { return new Error("User doesn't have enough points"); }
          
        if (req.param.rosterpositionID >= 0) {
            console.log('begin');

            theentry.pointtotal -= playerdata.preprice;
            theentry.save({transaction: t});      
            const newroster = await Roster.create({
                UserId: req.user.id,
                ContestId: req.param.contestID,
                NFLPlayerId: req.param.nflplayerID,
                RosterPositionId: req.param.rosterpositionID
            }, {
                transaction: t,
            });

            return [newroster, theentry];
        } else {
            return new Error("Select a roster position to put this player into")
        }
    });
}