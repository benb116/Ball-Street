const sequelize = require('./db');
const InitDB = require('./db/init');
const PopulateDB = require('./db/dbpopulate');

module.exports = async () => {
  await InitDB(sequelize);
  await PopulateDB(sequelize);
};
