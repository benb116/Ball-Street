/* eslint-disable security/detect-non-literal-fs-filename */
const path = require('path');
const fs = require('fs');
const sequelize = require('../db');
const PopulateDB = require('../db/dbpopulate');

const initSQL = fs.readFileSync(path.resolve(__dirname, '../db/dbinit.sql'), 'utf8');

module.exports = async () => {
  await sequelize.query(initSQL);
  await PopulateDB();
};
