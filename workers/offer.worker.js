const Queue = require('bull');
const offerQueue = new Queue('offer-queue');
const {Offer, ProtectedMatch, Trade } = require('../models');
const u = require('../util');

let running = false;

offerQueue.process(async (job) => {
    console.log('New Job', job.data);
    await evalOrderBook(job.data.ContestId, job.data.NFLPlayerId);
});


async function evalOrderBook(contestID, nflplayerID) {
    running = true;
    Promise.all([
        findSortOffers(contestID, nflplayerID, true),
        findSortOffers(contestID, nflplayerID, false)
    ]).then(off => compareBidsAsks(off[0], off[1])).then(console.log).then(() => running = false);
}

async function findSortOffers(contestID, nflplayerID, isbid) {
    const priceSort = (isbid ? 'DESC' : 'ASC');
    const possibleMatches = Offer.findAll({
        where: {
            ContestId: contestID,
            NFLPlayerId: nflplayerID,
            isbid: isbid,
            filled: false
        },
        order: [
            ['protected', 'ASC'],
            ['price', priceSort],
            ['createdAt', 'ASC']
        ]
    }).then(u.dv);
    return possibleMatches;
}

async function compareBidsAsks(bids, asks, bidind=0, askind=0) {
    console.log('ba', bidind, askind, bids.length, asks.length);
    if (!bids[bidind] || !asks[askind]) {
        console.log('EOL');
        return null;
    } else if (bids[bidind].price > asks[askind].price) {
        const [nextbid, nextask] = await matchOffers(bids[bidind], asks[bidind]);
        console.log('n', nextbid, nextask);
        if (nextbid || nextask) {
            return compareBidsAsks(bids, asks, bidind+nextbid, askind+nextask);
        }
    } else {
        console.log('PriceMismatch');
        return null;
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
        addToProtectedMatchQueue(oldOffer, newOffer);
        nextind = [Number(isBidOld), Number(!isBidOld)];
    }
    console.log(nextind);
    return nextind;
}

async function initTrade(bid, ask, price) {
    console.log('initTrade', price);
    await Offer.destroy({
        where: {
            id: [bid.id, ask.id]
        }
    });
    return [1, 1];
}

function addToProtectedMatchQueue(eOffer, nOffer) {
    console.log('protected');
    return 1;
}