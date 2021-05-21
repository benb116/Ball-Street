const sequelize = require('./db');
const InitDB = require('./db/init');
const PopulateDB = require('./db/dbpopulate');

module.exports = async () => {
  process.env.jest = true;
  await InitDB(sequelize);
  await PopulateDB(sequelize);
};
