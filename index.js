const sequelize = require('./db');
const models = require('./models');

(async () => {
    // await require('./db/dbpopulate')(sequelize);

    const services = require('./services/');

    // services.entry.getEntry({param: {entryID: 2}});
    // services.entry.createEntry({
    //     user: {id: 3},
    //     param: {contestID: 1}
    // });

    const tradeResults = await services.trade.preTradeDrop({
        user: {id: 2},
        param: {
            contestID: 1,
            // nflplayerID: 19045,
            nflplayerID: 17923,
            rosterpositionID: 2
        }
    })
    .catch(console.error);
    const offerObj = await services.offer.createOffer({
        user: {id: 2},
        param: { offerObj: {
            contestID: 1,
            // nflplayerID: 19045,
            nflplayerID: 17923,
            isbid: true,
            price: 1000,
        }}
    })
    .catch(console.error);
    if (!offerObj) {return;}
    await services.offer.cancelOffer({
        param: { offerID: offerObj.id }
    }).then(out => {
        console.log(out);
        return out;
    });
})();