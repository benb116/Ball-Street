// Trade worker
// Could be done within Offer worker
// Try to fill a pair of offers

const u = require('../util');
const config = require('../config');
const { hashkey } = require('../db/redisSchema');

const sequelize = require('../db');
const { Transaction } = require('sequelize');
const { Offer, Entry, Trade } = require('../models');
const isoOption = {
    // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

const redis = require("redis");
const client = redis.createClient();

const service = require('../features/trade/trade.service');

async function fillOffers(bidid, askid, price) {
    console.log('begin:', bidid, askid);
    const out = sequelize.transaction(isoOption, async (t) => {
        return await attemptFill(t, bidid, askid, price);
    }).catch(err => {
        switch(err) {
            case 'bid':
                console.log('bid err');
                return [1, 0];
            case 'ask':
                console.log('ask err');
                return [0, 1];
            default:
                console.log('both err');
                return [1, 1];
        }
    });
    return out;
}

async function attemptFill(t, bidid, askid, price) {
    let resp = [0, 0];
    const bidoffer = await Offer.findByPk(bidid, u.tobj(t));
    let boffer = u.dv(bidoffer);
    const askoffer = await Offer.findByPk(askid, u.tobj(t));
    let aoffer = u.dv(askoffer);

    if (!boffer.isbid) { console.log('bid not bid', boffer); throw new Error('bidoffer is not a bid'); }
    if (aoffer.isbid) { console.log('ask not ask', aoffer); throw new Error('askoffer is not a ask'); }

    if (!boffer || boffer.filled || boffer.cancelled) {
        console.log('no bid', bidid);
        resp[0] = 1;
    }
    if (!aoffer || aoffer.filled || aoffer.cancelled) {
        console.log('no ask', askid);
        resp[1] = 1;
    }
    if (resp[0] === 1 && resp[1] === 1) { throw new Error('both'); }
    if (resp[0] === 1) { throw new Error('bid'); }
    if (resp[1] === 1) { throw new Error('ask'); }

    console.log('past initial');
    const biduser = boffer.UserId;
    const askuser = aoffer.UserId;
    const player = boffer.NFLPlayerId;

    if (!price) {
        price = (boffer.createdAt < aoffer.createdAt ? boffer.price : aoffer.price);
    }

    const bidreq = {
        session: {user: {id: biduser}},
        param: {contestID: boffer.ContestId},
        body: {
            nflplayerID: player,
        },
        price: price
    };
    const askreq = {
        session: {user: {id: askuser}},
        param: {contestID: aoffer.ContestId},
        body: {
            nflplayerID: player,
        },
        price: price
    };

    const biddone = await service.tradeAdd(bidreq, t).catch(err => { console.log(err); return 1; } );
    const askdone = await service.tradeDrop(askreq, t).catch(err => { console.log(err); return 1; } );
    // if waiting for a lock, maybe return [0, 0]?
    if (Number(biddone) && Number(askdone)) { throw new Error('both'); }
    if (Number(biddone)) { throw new Error('bid'); }
    if (Number(askdone)) { throw new Error('ask'); }

    bidoffer.filled = true;
    askoffer.filled = true;

    await bidoffer.save({transaction: t});
    await askoffer.save({transaction: t});

    await Trade.create({
        bidId: boffer.id,
        askId: aoffer.id,
        price: price
    }, u.tobj(t));

    const contestID = boffer.ContestId;

    client.hmset(hashkey(contestID, player), 'lastTradePrice', price);
    client.publish('lastTrade', JSON.stringify({
            contestID: contestID,
            nflplayerID: nflplayerID,
            price: price,
        }));
    client.publish('offerFilled', JSON.stringify({
        userID: bidoffer.UserId,
        offerID: bidoffer.id
    }));
    client.publish('offerFilled', JSON.stringify({
        userID: askoffer.UserId,
        offerID: askoffer.id
    }));;
    console.log('finish trade', price);
    return [1, 1];
}

module.exports = {
    fillOffers,
    attemptFill
};