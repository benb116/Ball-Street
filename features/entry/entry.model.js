const { DataTypes } = require('sequelize');
// const u = require('../util/util');
const config = require('../../config');

// The model has common columns (UserId, ContestId, pointtotal)
// This script also generates columns based on the set roster in config
// So it will add a "QB1" column, a "FLEX2" column, etc. All with allowNull = true
// Those columns store the NFLPlayerId of the player in that roster position

function model() {
  const modelobj = {
    pointtotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    UserId: {
      type: DataTypes.INTEGER,
      references: { model: 'Users' },
      primaryKey: true,
    },
    ContestId: {
      type: DataTypes.INTEGER,
      references: { model: 'Contests' },
      primaryKey: true,
    },
  };

  // Add position columns as defined by config
  const rpos = Object.keys(config.Roster);
  rpos.forEach((p) => {
    modelobj[p] = {
      type: DataTypes.INTEGER,
      references: { model: 'NFLPlayers' },
      allowNull: true,
    };
  });

  return modelobj;
}

module.exports = function out(sequelize) {
  return sequelize.define('Entry', model(), { sequelize });
};
