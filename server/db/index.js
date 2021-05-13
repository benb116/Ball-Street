// This outputs the common sequelize object that is used for DB calls and transactions
// Can set app-wide DB settings

const { Sequelize } = require('sequelize');

const { db } = require('../secret');

const dbOptions = {
  logging: false,
  // isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
};

// const sequelize = new Sequelize('sqlite::memory:', dbOptions); // Example for sqlite
const sequelize = new Sequelize(`postgres://${db.user}:${db.pass}@${db.host}${db.name}`, dbOptions); // Example for postgres

module.exports = sequelize;
