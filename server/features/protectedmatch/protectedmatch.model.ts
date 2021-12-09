import { DataTypes, Sequelize } from 'sequelize';

export default function model(sequelize: Sequelize) {
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
  });
}
