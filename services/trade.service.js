// Trade service covers:
    // Adding and dropping pregame
    // Submitting and cancelling offers
const { Transaction } = require('sequelize');
const sequelize = require('../db');
const { Roster, Entry, NFLPlayer, RosterPosition, Offer, ProtectedMatch, Trade, User } = require('../models');
const u = require('../util');
const config = require('../config');
const isoOption = {
    // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

module.exports = {
    tradeAdd,
    tradeDrop,
    preTradeAdd,
    preTradeDrop,
    getUserTrades,
};

async function tradeAdd(req, t) {
    const _player = req.params.nflplayerID;
    // Get user entry
    const theentry = await Entry.findOne({
        where: {
            UserId: req.session.user.id,
            ContestId: req.params.contestID
        },
        transaction: t,
        lock: t.LOCK.UPDATE
    });

    // Determine if user already has player on roster
    const isOnTeam = u.isPlayerOnRoster(theentry, _player);
    if (isOnTeam) { throw new Error('Player is on roster'); }

    const pts = theentry.dataValues.pointtotal;
    // console.log("POINTS", pts);

    // Get player price and position
    const playerdata = await NFLPlayer.findByPk(_player, {
        attributes: ['preprice', 'NFLPositionId'],
        transaction: t
    }).then(d => d.dataValues);
    // console.log("PDATA", playerdata);

    const tradeprice = req.params.price || playerdata.preprice;
    // Checks
    if (!tradeprice) { throw new Error("Player has no preprice"); }
    if (tradeprice > pts) { throw new Error("User doesn't have enough points"); }
      
    // Deduct cost from points
    theentry.pointtotal -= tradeprice;

    const playerType = playerdata.NFLPositionId;
    if (req.params.rosterposition) { // If a roster position was specified
        // Is it a valid one?
        const isinvalid = u.isInvalidSpot(playerType, req.params.rosterposition);
        if (isinvalid) { throw new Error(isinvalid); }
        // Is it an empty one?
        if (theentry[req.params.rosterposition] !== null) {
            throw new Error('There is a player in that spot');
        }
        theentry[req.params.rosterposition] = _player;

    } else {
        // Find an open spot
        const isOpen = u.isOpenRoster(theentry, playerType);
        if (!isOpen) { throw new Error('There are no open spots'); }
        theentry[isOpen] = _player;
    }
    await theentry.save({transaction: t});

    return 0;
}

async function tradeDrop(req, t) {
    // Remove from roster
    const theentry = await Entry.findOne({
        where: {
            UserId: req.session.user.id,
            ContestId: req.params.contestID
        },
        transaction: t,
        lock: t.LOCK.UPDATE
    });

    const isOnTeam = u.isPlayerOnRoster(theentry, req.params.nflplayerID);
    if (!isOnTeam) { throw new Error('Player is not on roster'); }
    theentry[isOnTeam] = null;

    if (req.params.price) {
        theentry.pointtotal += req.params.price;
    } else {
        // How much to add to point total
        const preprice = await NFLPlayer.findByPk(req.params.nflplayerID, {
            attributes: ['preprice'],
            transaction: t
        }).then(d => d.dataValues.preprice);
   
        theentry.pointtotal += preprice;
    }

    await theentry.save({transaction: t});

    return 0;
}

function preTradeAdd(req) {
    return sequelize.transaction(isoOption, async (t) => {
        return tradeAdd(req, t);
    });
}

function preTradeDrop(req) {
    return sequelize.transaction(isoOption, async (t) => {
        return tradeDrop(req, t);
    });
}

function getUserTrades(req) {
    return Trade.findAll({
        include: {
            model: User,
            where: {
                UserId: req.session.user.id
            }
        }
    }).then(u.dv).then(console.log).catch(console.error);
}