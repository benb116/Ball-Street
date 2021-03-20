const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Contest', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nflweek: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {sequelize});
};
