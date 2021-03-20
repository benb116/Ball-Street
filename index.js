const sequelize = require('./db');
const models = require('./models');

(async () => {
    await require('./db/dbpopulate')(sequelize);

    const controllers = require('./controllers/');

    // controllers.entry.getEntry({param: {entryID: 2}});
    // controllers.entry.createEntry({
    //     user: {id: 3},
    //     param: {contestID: 1}
    // });

    console.log('begin');

    // await controllers.trade.preTradeAdd({
    //     user: {id: 1},
    //     param: {
    //         contestID: 1,
    //         nflplayerID: 40117,
    //         rosterpositionID: 1
    //     }
    // });

    await controllers.trade.preTradeAdd({
        user: {id: 2},
        param: {
            contestID: 1,
            nflplayerID: 17923,
            rosterpositionID: 8
        }
    }).then(console.log).then(() => {
        controllers.entry.getEntry({param: {entryID: 2}}).then(console.log);
    });


})();
// const { NFLPosition, RosterPosition, NFLDivision, NFLTeam, NFLPlayer, Contest, User } = models;