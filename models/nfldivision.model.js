const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('NFLDivision', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isafc: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {sequelize});
};
