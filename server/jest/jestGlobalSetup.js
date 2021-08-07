const sequelize = require('../db');
const PopulateDB = require('../db/dbpopulate');

module.exports = async () => {
  await PopulateDB(sequelize);
};
