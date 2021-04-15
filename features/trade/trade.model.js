const Sequelize = require('sequelize');

module.exports = function model(sequelize, DataTypes) {
  return sequelize.define('Trade', {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    price: { // What was the actual price that was traded at
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bidId: {
      type: DataTypes.UUID,
      references: { model: 'Offers' },
      allowNull: false,
    },
    askId: {
      type: DataTypes.UUID,
      references: { model: 'Offers' },
      allowNull: false,
    },
  }, { sequelize });
};
