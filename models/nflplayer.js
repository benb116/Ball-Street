const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('NFLPlayer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    jersey: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    preprice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    statprice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    NFLPositionId: {
      type: DataTypes.INTEGER,
      validate: {
        isNotFlex(value) {
          if (!value || value < 0) { throw new Error('Cannot have a NFLPlayer as a flex'); }
        }
      }
    }
  }, {sequelize});
};
