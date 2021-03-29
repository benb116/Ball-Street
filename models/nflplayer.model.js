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
    preprice: { // How much can someone pay to add before games start
      type: DataTypes.INTEGER,
      allowNull: true
    },
    statprice: { // If games ended now, how many points would he be worth
      type: DataTypes.INTEGER,
      allowNull: true
    },
    NFLPositionId: { // RB, not RB2
      type: DataTypes.INTEGER,
      references: { model: 'NFLPositions' },
      allowNull: false,
      validate: {
        isNotFlex(value) { // Make sure we never list a player as a true flex
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
