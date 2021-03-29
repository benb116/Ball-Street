const u = require('../util');
const config = require('../config');
const Queue = require('bull');
const redis = require("redis");
const client = redis.createClient();

const offerQueue = new Queue('offer-queue');
const protectedQueue = new Queue('protected-queue');

const {Offer, ProtectedMatch, Trade } = require('../models');
const {fillOffers} = require('./trade.worker');

offerQueue.process(async (job) => {
    console.log('\r\nNew Job', job.data.id);
    await evalOrderBook(job.data.ContestId, job.data.NFLPlayerId);
});

async function evalOrderBook(contestID, nflplayerID) {
    Promise.all([
        findSortOffers(contestID, nflplayerID, true),
        findSortOffers(contestID, nflplayerID, false)
    ])
    .then(([bids, asks]) => compareBidsAsks(bids, asks))
    .then(([player, nextbid, nextask]) => {
        const bestbid = (nextbid ? nextbid.price : NaN);
        const bestask = (nextask ? nextask.price : NaN);
        client.hmset(player, 'bestbid', bestbid, 'bestask', bestask);
        client.publish('priceUpdate', player+' '+bestbid+' '+bestask);
    });
    // .then(console.log);
}

async function findSortOffers(contestID, nflplayerID, isbid) {
    const priceSort = (isbid ? 'DESC' : 'ASC');
    const possibleMatches = Offer.findAll({
        where: {
            ContestId: contestID,
            NFLPlayerId: nflplayerID,
            isbid: isbid,
            filled: false,
            cancelled: false,
        },
        order: [
            ['price', priceSort],
            ['protected', 'ASC'],
            ['createdAt', 'ASC']
        ]
    }).then(u.dv);
    return possibleMatches;
}

async function compareBidsAsks(bids, asks, bidind=0, askind=0) {
    console.log('bidaskind', bidind, askind, bids.length, asks.length);
    if (!bids[bidind] || !asks[askind]) {
        console.log('EOL');
        const player = (bids[0] ? bids[0].NFLPlayerId : (asks[0] ? asks[0].NFLPlayerId : 0));
        return [player, bids[bidind], bids[askind]];

    } else if (bids[bidind].price > asks[askind].price) {
        const [nextbid, nextask] = await matchOffers(bids[bidind], asks[askind]);
        if (nextbid || nextask) {
            return compareBidsAsks(bids, asks, bidind+nextbid, askind+nextask);
        }

    } else {
        console.log('PriceMismatch');
        return [bids[0].NFLPlayerId, bids[bidind], bids[askind]];
    }
}

async function matchOffers(bid, ask) {
    // Determine which is older
    // Determine if old is protected
    // Set trade price to older's price

    const isBidOld = (bid.createdAt < ask.createdAt);
    const oldOffer = (isBidOld ? bid : ask);
    const newOffer = (!isBidOld ? bid : ask);
    const isOldProtected = oldOffer.protected;
    let nextind = [];

    if (!isOldProtected) {
        // Try to trade rn
        const tradePrice = (isBidOld ? bid.price : ask.price);
        nextind = await initTrade(bid, ask, oldOffer.price);
    } else {
        // Add delayed to protected queue
        await addToProtectedMatchQueue(oldOffer, newOffer);
        nextind = [Number(!isBidOld), Number(isBidOld)];
    }
    console.log('nextind', nextind);
    return nextind;
}

async function initTrade(bid, ask, price) {
    output = await fillOffers(bid.id, ask.id, price);
    return output;
}

async function addToProtectedMatchQueue(eOffer, nOffer) {
    console.log('protected', eOffer.id, nOffer.id);
    protectedQueue.add({
        existingOffer: eOffer.id,
        newOffer: nOffer.id,
    }, { delay: config.ProtectionDelay*1000 });
    // Send ping to user
    client.publish('protectedMatch', eOffer.UserId+' '+eOffer.id);
    return 1;
}

protectedQueue.process(async (job) => {
    await fillOffers(job.data.existingOffer, job.data.newOffer);
});