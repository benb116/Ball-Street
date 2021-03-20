const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Entry', {
    pointtotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10000
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
  }, { sequelize });
};
