const sequelize = require('./db');
const models = require('./models');

(async () => {
    await require('./db/dbpopulate')(sequelize);

    const services = require('./services/');

    // services.entry.getEntry({param: {entryID: 2}});
    // services.entry.createEntry({
    //     user: {id: 3},
    //     param: {contestID: 1}
    // });

    console.log('begin');

    await services.trade.preTradeAdd({
        user: {id: 2},
        param: {
            contestID: 1,
            // nflplayerID: 19045,
            nflplayerID: 17923,
            rosterpositionID: 2
        }
    })
    .then(console.log)
    .catch(console.error)
    .then(() => {
        return services.trade.preTradeDrop({
            user: {id: 2},
            param: {
                contestID: 1,
                // nflplayerID: 19045,
                nflplayerID: 17923,
                rosterpositionID: 2
            }
        });
    })
    .then(console.log)
    .catch(console.error);
    // });



})();
// const { NFLPosition, RosterPosition, NFLDivision, NFLTeam, NFLPlayer, Contest, User } = models;