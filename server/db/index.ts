// This outputs the common sequelize object that is used for DB calls and transactions
// Can set app-wide DB settings

import { Sequelize, Transaction } from 'sequelize';

import logger from '../utilities/logger';
import sec from '../secret';

let {
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

const dbOptions = {
  // eslint-disable-next-line no-console
  logging: (process.env.NODE_ENV === 'development' ? logger.verbose : false),
  isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
  // We can used Read Committed here because of how the DB is set up
  // Prevent nonrepeatable reads by using select for update (row-level lock)
  // Forces transactions to wait until transaction with lock finishes
};

// Pull DB information from secrets file when testing
// since test doesn't run within docker, doesn't have env vars
if (process.env.NODE_ENV === 'test' || !process.env.NODE_ENV) {
  // eslint-disable-next-line global-require
  DB_USER = sec.db.user;
  DB_PASS = sec.db.pass;
  DB_HOST = sec.db.host;
  DB_PORT = sec.db.port.toString();
  DB_NAME = sec.db.name;
} else {
  logger.info(`DB connection settings - ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
}
const sequelize = new Sequelize(
  `postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
  dbOptions,
); // Example for postgres

async function testDB() {
  try {
    await sequelize.authenticate();
    if (process.env.NODE_ENV !== 'test') {
      logger.info('Database connection has been established successfully.');
    }
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
}

testDB();

export default sequelize;
