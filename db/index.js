const { Sequelize } = require('sequelize');

const dbOptions = {
    // logging: false,
    // isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
};

// const sequelize = new Sequelize('sqlite::memory:', dbOptions); // Example for sqlite
const sequelize = new Sequelize('postgres://localhost:5432/ballstreet', dbOptions); // Example for postgres

module.exports = sequelize;