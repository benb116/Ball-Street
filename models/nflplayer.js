const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('NFLPlayer', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: true
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
