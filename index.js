const { Sequelize, Transaction } = require('sequelize');

const dbOptions = {
    // logging: false,
    // isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
};

const sequelize = new Sequelize('sqlite::memory:', dbOptions); // Example for sqlite
// const sequelize = new Sequelize('postgres://localhost:5432/Ben', dbOptions); // Example for postgres

const models = require('./models/').initModels(sequelize);

(async () => {
    await require('./db/dbpopulate')(sequelize);

    const controllers = require('./controllers/')(sequelize);

    // controllers.entry.getEntry({param: {entryID: 2}});
    // controllers.entry.createEntry({
    //     user: {id: 3},
    //     param: {contestID: 1}
    // });

    controllers.trade.preTradeAdd({
        user: {id: 1},
        param: {
            contestID: 1,
            nflplayerID: 40117,
            rosterpositionID: 1
        }
    }).then(console.log);

})();
// const { NFLPosition, RosterPosition, NFLDivision, NFLTeam, NFLPlayer, Contest, User } = models;