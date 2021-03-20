const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Trade', {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false
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
  }, {sequelize});
};
