const sequelize = require('./db');
const models = require('./models');
const u = require('util');

const delay = ms => new Promise(res => setTimeout(res, ms));
console.log('go');
(async () => {
    await require('./db/dbpopulate')(sequelize);

    const services = require('./services/');

    // services.entry.getEntry({param: {entryID: 2}});
    // services.entry.createEntry({
    //     user: {id: 3},
    //     param: {contestID: 1}
    // });

    const tradeResults = await services.trade.preTradeAdd({
        user: {id: 1},
        param: {
            contestID: 1,
            // nflplayerID: 19045,
            nflplayerID: 17923,
            rosterposition: "RB1"
        }
    }).then(u.dv).then(console.log).catch(console.error);

    const tradeResults2 = await services.trade.preTradeAdd({
        user: {id: 2},
        param: {
            contestID: 1,
            // nflplayerID: 19045,
            nflplayerID: 17923,
            rosterposition: "RB2"
        }
    }).then(u.dv).then(console.log).catch(console.error);

    // const tradeResults3 = await services.trade.preTradeAdd({
    //     user: {id: 3},
    //     param: {
    //         contestID: 1,
    //         // nflplayerID: 19045,
    //         nflplayerID: 17923,
    //         rosterposition: "FLEX1"
    //     }
    // }).then(u.dv).then(console.log).catch(console.error);

    // const tradeResults4 = await services.trade.preTradeAdd({
    //     user: {id: 2},
    //     param: {
    //         contestID: 1,
    //         nflplayerID: 19045,
    //         // nflplayerID: 17923,
    //         // rosterposition: 4
    //     }
    // }).then(u.dv).then(console.log).catch(console.error);

    const offerObj = await services.offer.createOffer({
        user: {id: 3},
        param: { offerObj: {
            contestID: 1,
            // nflplayerID: 19045,
            nflplayerID: 17923,
            isbid: true,
            price: 1000,
            protected: true,
        }}
    }).then(u.dv).catch(console.error);
    if (!offerObj) {return;}

    await delay(1000);

    const offerObj3 = await services.offer.createOffer({
        user: {id: 2},
        param: { offerObj: {
            contestID: 1,
            // nflplayerID: 19045,
            nflplayerID: 17923,
            isbid: false,
            price: 900,
        }}
    }).then(u.dv).catch(console.error);
    // await delay(1000);

    const offerObj4 = await services.offer.createOffer({
        user: {id: 1},
        param: { offerObj: {
            contestID: 1,
            // nflplayerID: 19045,
            nflplayerID: 17923,
            isbid: false,
            price: 800,
        }}
    }).then(u.dv).catch(console.error);
    // await delay(1000);

    const offerObj5 = await services.offer.createOffer({
        user: {id: 4},
        param: { offerObj: {
            contestID: 1,
            // nflplayerID: 19045,
            nflplayerID: 17923,
            isbid: true,
            price: 1200,
        }}
    }).then(u.dv).catch(console.error);
    // await delay(1000);

    await services.nflplayer.getNFLPlayerOfferSummary({
        param: {
            nflplayerID: offerObj.NFLPlayerId,
            contestID: 1,
        }
    }).then(res => {
        const [bids, asks] = res;
        // console.log(bids);
        const thebids = bids.map(p => { p.count = Number(p.count); return p; }).sort((a, b) => Number(b.count) - Number(a.count));
        const theasks = asks.map(p => { p.count = Number(p.count); return p; }).sort((a, b) => Number(b.count) - Number(a.count));
        return [thebids, theasks];
    })
    .then(console.log);

    await services.offer.cancelOffer({
        param: { offerID: offerObj.id }
    });
})();