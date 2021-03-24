// Offer service covers:
    // Creating and deleting an offer
    // Getting info about a user's offers across contests
const { Transaction } = require('sequelize');
const sequelize = require('../db');
const { Offer, Entry } = require('../models');
const u = require('../util');
const config = require('../config');
const isoOption = {
    // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const service = require('../services/trade.service');

async function fillOffers(bidid, askid, price) {
    console.log('begin:', bidid, askid);
    const out = sequelize.transaction(isoOption, async (t) => {
        return await attemptFill(bidid, askid, price);
    });
    return out;
}

async function attemptFill(bidid, askid, price) {
    let resp = [1, 1];

    const bidoffer = await Offer.findByPk(bidid, u.tobj(t));
    let boffer = u.dv(bidoffer);
    const askoffer = await Offer.findByPk(askid, u.tobj(t));
    let aoffer = u.dv(askoffer);

    if (!boffer.isbid) { [aoffer, boffer] = [boffer, aoffer]; }

    if (!boffer || boffer.filled || boffer.cancelled) {
        console.log('no bid', bidid);
        resp[0] = 0;
    }
    if (!aoffer || aoffer.filled || aoffer.cancelled) {
        console.log('no ask', askid);
        resp[1] = 0;
    }
    if (resp[0] === 0 || resp[1] === 0) { return resp; }

    const biduser = boffer.UserId;
    const askuser = aoffer.UserId;
    const player = boffer.NFLPlayerId;

    if (!price) {
        price = (boffer.createdAt < aoffer.createdAt ? boffer.price : aoffer.price);
    }

    const bidreq = {
        user: {id: biduser},
        param: {
            contestID: boffer.ContestId,
            nflplayerID: player,
            price: price,
        }
    };
    const askreq = {
        user: {id: askuser},
        param: {
            contestID: aoffer.ContestId,
            nflplayerID: player,
            price: price,
        }
    };

    bidoffer.filled = true; bidoffer.save({transaction: t});
    askoffer.filled = true; askoffer.save({transaction: t});

    const biddone = await service.tradeAdd(bidreq, t);
    const askdone = await service.tradeDrop(askreq, t);

    return [1, 1];

}

module.exports = {
    fillOffers,
    attemptFill
};