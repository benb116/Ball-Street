module.exports = function model(sequelize, DataTypes) {
  return sequelize.define('Trade', {
    price: { // What was the actual price that was traded at
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bidId: {
      type: DataTypes.UUID,
      references: { model: 'Offers' },
      allowNull: false,
      primaryKey: true,
    },
    askId: {
      type: DataTypes.UUID,
      references: { model: 'Offers' },
      allowNull: false,
      primaryKey: true,
    },
  }, { sequelize });
};
