const path = require('path');
const fs = require('fs');
const sequelize = require('../db');
const { set } = require('../db/redis');

const initSQL = fs.readFileSync(path.resolve(__dirname, '../db/dbinit.sql'), 'utf8');
const popSQL = fs.readFileSync(path.resolve(__dirname, '../db/dbpopulate.sql'), 'utf8');

module.exports = async () => {
  await set.CurrentWeek(1);
  await sequelize.query(initSQL);
  await sequelize.query(popSQL);
};
