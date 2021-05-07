const sequelize = require('./db');

module.exports = async () => {
  sequelize.close();
};
