import { DataTypes } from 'sequelize';

export default function model(sequelize) {
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
}
