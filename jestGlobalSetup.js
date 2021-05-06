const sequelize = require('./db');
const PopulateDB = require('./db/dbpopulate');

module.exports = async () => {
  console.log('\nhello, this is just before tests start running');
  return PopulateDB(sequelize);
};
