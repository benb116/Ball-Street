const Sequelize = require('sequelize');
const config = require('../config');

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
      default: 0
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
      references: { model: 'NFLPositions' },
      allowNull: false,
      validate: {
        isNotFlex(value) {
          if (value === config.FlexNFLPositionId) { throw new Error('Cannot have a NFLPlayer as a flex'); }
        }
      }
    },
    NFLTeamId: {
      type: DataTypes.INTEGER,
      references: { model: 'NFLTeams' },
      allowNull: false,
    }
  }, {sequelize});
};
