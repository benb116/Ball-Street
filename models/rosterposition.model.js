const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('RosterPosition', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    NFLPositionId: {
      type: DataTypes.INTEGER,
      references: { model: 'NFLPositions' },
      allowNull: false,
    }
  }, {sequelize});
};
