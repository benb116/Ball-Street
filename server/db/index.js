// This outputs the common sequelize object that is used for DB calls and transactions
// Can set app-wide DB settings

const { Sequelize, Transaction } = require('sequelize');

const { db } = require('../secret');

const dbOptions = {
  // logging: false,
  isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
};

// Should we use the test database?
const testSuffix = process.env.NODE_ENV === 'test' ? '-test' : '';

// const sequelize = new Sequelize('sqlite::memory:', dbOptions); // Example for sqlite
const sequelize = new Sequelize(`postgres://${db.user}:${db.pass}@${db.host}${db.name}${testSuffix}`, dbOptions); // Example for postgres

module.exports = sequelize;
