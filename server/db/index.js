// This outputs the common sequelize object that is used for DB calls and transactions
// Can set app-wide DB settings

const { Sequelize, Transaction } = require('sequelize');
const sec = require('../secret');

let {
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

const dbOptions = {
  logging: false,
  isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
};

if (process.env.NODE_ENV === 'test') {
  DB_USER = sec.DB_USER;
  DB_PASS = sec.DB_PASS;
  DB_HOST = sec.DB_HOST;
  DB_PORT = sec.DB_PORT;
  DB_NAME = sec.DB_NAME;
}

const sequelize = new Sequelize(
  `postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
  dbOptions,
); // Example for postgres

async function testDB() {
  try {
    await sequelize.authenticate();
    if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
      console.log('Database connection has been established successfully.');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to connect to the database:', error);
  }
}

testDB();

module.exports = sequelize;
