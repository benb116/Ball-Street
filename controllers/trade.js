// Trade controller covers:
    // Adding and dropping pregame
    // Submitting and cancelling offers
const { Transaction } = require('sequelize');
const { Roster, Entry, NFLPlayer, RosterPosition, Offer, ProtectedMatch, Trade } = require('../models')();
const u = require('../util');

const isoOption = {
    // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

module.exports = function(sequelize) {
    return {
        preTradeAdd: preTradeAdder(sequelize),
        preTradeDrop: preTradeDroper(sequelize),
    };
};

function preTradeDroper(sq) {

}

function preTradeAdder(sq) {
    return async function(req, res) {
        return await sq.transaction(isoOption, async (t) => {
            // user
            // contest
                // can get entry and pt total
            // nflplayer
            // rosterposition (optional)

            // Get entry point total
            // Get NFLplayer preprice
            console.log(req);

            const pts = await Entry.findOne({
                where: {
                    UserId: req.user.id,
                    ContestId: req.param.contestID
                },
                attributes: ['pointtotal'],
                transaction: t,
                lock: Transaction.LOCK.UPDATE
            }).then(d => d.dataValues.pointtotal);
            console.log("POINTS", pts);

            const playerdata = await NFLPlayer.findByPk(req.param.nflplayerID, {
                attributes: ['preprice', 'NFLPositionId'],
                transaction: t
            }).then(d => d.dataValues);
            console.log("PDATA", playerdata);


            if (playerdata.preprice > pts) { throw new Error("User doesn't have enough points"); }
            if (req.param.rosterpositionID >= 0) {
                console.log('begin');
                return await Roster.create({
                    UserId: req.user.id,
                    ContestId: req.param.contestID,
                    NFLPlayerId: req.param.nflplayerID,
                    RosterPositionId: req.param.rosterpositionID
                }, {
                    transaction: t,
                });
            }
        });
    };
}