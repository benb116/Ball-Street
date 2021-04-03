const { Sequelize } = require('sequelize');
const secret = require('../secret');
const dbOptions = {
    logging: false,
    // isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
};

// const sequelize = new Sequelize('sqlite::memory:', dbOptions); // Example for sqlite
const sequelize = new Sequelize('postgres://'+secret.db.user+':'+secret.db.pass+'@'+secret.db.host+secret.db.name, dbOptions); // Example for postgres

module.exports = sequelize;