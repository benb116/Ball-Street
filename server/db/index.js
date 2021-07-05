// This outputs the common sequelize object that is used for DB calls and transactions
// Can set app-wide DB settings

const { Sequelize, Transaction } = require('sequelize');

const {
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

const dbOptions = {
  // logging: false,
  isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
};

// Should we use the test database?
const testSuffix = process.env.NODE_ENV === 'test' ? '-test' : '';

const sequelize = new Sequelize(
  `postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}${testSuffix}`,
  dbOptions,
); // Example for postgres

async function testDB() {
  try {
    await sequelize.authenticate();
    // eslint-disable-next-line no-console
    console.log('Connection has been established successfully.');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to connect to the database:', error);
  }
}

testDB();

module.exports = sequelize;
