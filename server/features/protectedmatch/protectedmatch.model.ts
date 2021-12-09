import { DataTypes } from 'sequelize';

export default function model(sequelize) {
  return sequelize.define('ProtectedMatch', {
    existingId: {
      type: DataTypes.UUID,
      references: { model: 'Offers' },
      primaryKey: true,
    },
    newId: {
      type: DataTypes.UUID,
      references: { model: 'Offers' },
      primaryKey: true,
    },
  }, { sequelize });
}
